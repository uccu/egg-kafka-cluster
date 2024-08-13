import { Application, EggApplication } from 'egg';
import { ConsumerGlobalConfig, ConsumerStream, KafkaConsumer, Producer, ProducerStream, ProducerGlobalConfig, ProducerTopicConfig, SubscribeTopicList, WriteStreamOptions } from 'node-rdkafka';
import path from 'node:path';
import { lowerFirst, isFunction, isArray } from 'lodash';

type ConsumerData = {
  value: Buffer,
  size: number,
  key: null | string,
  topic: string,
  offset: number,
  partition: number,
  timestamp: number,
};

export class Consumer {
  protected readonly app: Application;
  constructor(app: Application) {
    this.app = app;
  }
}


export class Kafka {

  app: EggApplication;
  consumer: ConsumerStream;
  producers: Map<string, ProducerStream>;

  constructor(app: EggApplication) {
    this.app = app;
    this.producers = new Map();
  }

  initConsumer() {

    if (isArray(this.app.config.kafka.readStreamOptions.topics)) {
      if (this.app.config.kafka.readStreamOptions.topics.length === 0) {
        return;
      }
    }

    // metadata.broker.list
    const consumerGlobalConfig:ConsumerGlobalConfig = {};
    if (process.env.BROKER_LIST) consumerGlobalConfig['metadata.broker.list'] = process.env.BROKER_LIST;

    this.consumer = KafkaConsumer.createReadStream(
      { ...this.app.config.kafka.consumerGlobalConfig, ...consumerGlobalConfig },
      this.app.config.kafka.consumerTopicConfig,
      this.app.config.kafka.readStreamOptions,
    );

    this.consumer.on('data', (message: ConsumerData) => {
      try {
        const data = JSON.parse(message.value.toString()) as Record<string, unknown>;
        this.app.messenger.sendRandom('kafka:read', { topic: message.topic, data });
      } catch (e) {
        this.app.logger.error('[mq-consume] MQ消费数据解析失败: %s, %s, %s', message.topic, message.value.toString(), e);
      }
    });

    this.consumer.consumer.once('subscribed', (topics: SubscribeTopicList) => {
      this.app.logger.info('[mq-consume] MQ消费订阅成功: %s', topics.join(','));
      this.app.emit('kafka:consumer-subscribed');
    });

  }

  initProducer(topic: string, opts?: { producerGlobalConfig?: ProducerGlobalConfig, producerTopicConfig?: ProducerTopicConfig, writeStreamOptions?: WriteStreamOptions }) {

    const producerGlobalConfig: ProducerGlobalConfig = {};
    if (process.env.BROKER_LIST) producerGlobalConfig['metadata.broker.list'] = process.env.BROKER_LIST;

    const stream = Producer.createWriteStream(
      { ...this.app.config.kafka.producerGlobalConfig, ...producerGlobalConfig, ...opts?.producerGlobalConfig },
      { ...this.app.config.kafka.producerTopicConfig, ...opts?.producerTopicConfig },
      { topic, ...this.app.config.kafka.writeStreamOptions, ...opts?.writeStreamOptions },
    );
    this.producers.set(topic, stream);

    stream.on('error', err => {
      this.app.logger.error('[mq-produce] MQ生产错误: %s, %s', topic, err);
    });

  }

  appDelegate() {
    const dir = path.join(this.app.config.baseDir, 'app/mq');
    this.app.loader.loadToApp(dir, 'MQ', {
      call: true,
      caseStyle: 'lower',
      initializer: (model: any) => {
        return new model(this.app);
      },
    });

    this.app.messenger.on('kafka:read', ({ topic, data }: { topic: string, data: Record<string, unknown> }) => {

      const file = topic.split('-')[0];
      const cla = (this.app as Application).MQ[file];
      if (!cla) {
        this.app.logger.warn('[mq-consume] MQ执行类不存在: %s, %s', topic, JSON.stringify(data));
        return;
      }

      let method = lowerFirst(topic.split('-')[1] || '');
      if (!method) {
        method = 'run';
      }

      if (!isFunction(cla[method])) {
        this.app.logger.warn('[mq-consume] MQ执行类没有对应处理tag方法: %s, %s', topic, JSON.stringify(data));
        return;
      }

      cla[method](data);
    });
  }

  agentDelegate() {
    this.app.messenger.on('kafka:write', ({ topic, data }: { topic: string, data: Record<string, unknown> }) => {
      this.write(topic, data);
    });
  }

  write(topic: string, data: Record<string, unknown>) {

    // @ts-ignore
    if (this.app.options.type !== 'agent') {
      this.app.messenger.sendToAgent('kafka:write', { topic, data });
      return;
    }

    if (!this.producers.has(topic)) {
      this.producers.set(topic, Producer.createWriteStream(
        this.app.config.kafka.producerGlobalConfig,
        this.app.config.kafka.producerTopicConfig,
        { topic, ...this.app.config.kafka.writeStreamOptions },
      ));
    }

    this.producers.get(topic)?.write(Buffer.from(JSON.stringify(data)), err => {
      if (err) this.app.logger.error('[mq-produce] MQ生产数据失败: %s, %s, %s', topic, JSON.stringify(data), err);
    });

  }


}
