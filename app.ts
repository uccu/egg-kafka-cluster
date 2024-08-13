import { Application, IBoot } from 'egg';
import { Kafka } from 'lib/kafka';

export default class FooBoot implements IBoot {

  app: Application;

  constructor(app: Application) {
    this.app = app;
    this.app.kafka = new Kafka(app);
  }

  async didLoad() {
    this.app.kafka.appDelegate();
  }

}
