import { Kafka } from 'lib/kafka';

declare module 'egg' {
  interface Application {
    MQ: { [k: string]: any }
  }

  interface EggApplication {
    kafka: Kafka;
  }
}

export * from 'lib/kafka';
