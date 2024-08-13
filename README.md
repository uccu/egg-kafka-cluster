# egg-kafka-cluster

provides egg bindings for the kafka.

[![npm download](https://img.shields.io/github/actions/workflow/status/uccu/egg-kafka-cluster/publish.yml)](https://github.com/uccu/egg-kafka-cluster/actions/workflows/publish.yml)
[![NPM version][npm-image]][npm-url]
[![GitHub issues](https://img.shields.io/github/issues/uccu/egg-kafka-cluster)](https://github.com/uccu/egg-kafka-cluster/issues)
![GitHub](https://img.shields.io/github/license/uccu/egg-kafka-cluster)

[npm-image]: https://img.shields.io/npm/v/egg-kafka-cluster.svg?style=flat-square
[npm-url]: https://npmjs.com/package/egg-kafka-cluster
[download-image]: https://img.shields.io/npm/dm/egg-kafka-cluster.svg?style=flat-square
[download-url]: https://npmjs.com/package/egg-kafka-cluster

## Install

```bash
$ npm i egg-kafka-cluster --save
```

## Configuration

```js
// {app_root}/config/plugin.ts
export const kafkaCluster = {
  enable: true,
  package: 'egg-kafka-cluster',
};

// {app_root}/config/config.default.ts
exports.kafka = {
  consumerGlobalConfig: {
    'group.id': 'consumer-default',
    'metadata.broker.list': 'kafka',
  },
  consumerTopicConfig: {
    'auto.offset.reset': 'beginning',
  },
  readStreamOptions: {
    topics: [ 'activity' ],
  },
  producerGlobalConfig: {
    'metadata.broker.list': 'kafka',
  },
  producerTopicConfig: {},
  writeStreamOptions: {
    topic: 'activity',
  },
};
```

## Usage

```typescript
// Producer
this.app.kafka.write('activity', {status: 'start'});

// Consumer
// {app_root}/app/mq/Activity.ts
import { Consumer } from 'egg-kafka-cluster';
export default class Activity extends Consumer {
  async run(data: Record<string, unknown>) {
    console.log('Topic Activity Data: %s', JSON.stringify(data));
  }
}


```



see [config/config.default.ts](config/config.default.ts) for more detail.

## Questions & Suggestions

Please open an issue [here](https://github.com/uccu/egg-kafka-cluster/issues).

## License

[MIT](LICENSE)
