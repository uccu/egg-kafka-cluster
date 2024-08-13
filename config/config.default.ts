import { ConsumerGlobalConfig, ConsumerTopicConfig, ProducerGlobalConfig, ProducerTopicConfig, ReadStreamOptions, WriteStreamOptions } from 'node-rdkafka';

type ConsumerSendType = 'random' | 'all';


export type ConsumerConfig = {
  consumer: string;
  tags: string[];
  numOfMessages?: number;
  waitSeconds?: number;
  send?: ConsumerSendType;
  sure?: boolean;
  consumeWait?: number;
  topic?: string;
};

export default function() {

  return {
    keys: 'kafka', kafka: {
      consumerGlobalConfig: {
        'group.id': 'consumer-default',
        'metadata.broker.list': 'kafka',
      } as ConsumerGlobalConfig,
      consumerTopicConfig: {
        'auto.offset.reset': 'beginning',
      } as ConsumerTopicConfig,
      readStreamOptions: {
        topics: [ 'activity' ],
      } as ReadStreamOptions,
      producerGlobalConfig: {
        'metadata.broker.list': 'kafka',
      } as ProducerGlobalConfig,
      producerTopicConfig: {} as ProducerTopicConfig,
      writeStreamOptions: {
        topic: 'activity',
      } as WriteStreamOptions,
    },
  };
}
