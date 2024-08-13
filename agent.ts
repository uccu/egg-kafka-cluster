import { Agent, IBoot } from 'egg';
import { Kafka } from 'lib/kafka';
export default class FooBoot implements IBoot {

  app: Agent;

  constructor(app: Agent) {
    this.app = app;
    this.app.kafka = new Kafka(app);
  }

  async didLoad() {
    this.app.kafka.agentDelegate();
  }

  async serverDidReady(): Promise<void> {
    this.app.kafka.initConsumer();
  }

}
