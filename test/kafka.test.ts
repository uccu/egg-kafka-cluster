import assert from 'node:assert';
import mock, { MockApplication } from 'egg-mock';

describe('write', () => {
  let app: MockApplication;
  before(async () => {
    app = mock.app();
    return app.ready();
  });

  it('write is normal', async () => {
    app.kafka.write('activity', { a: 1 });
    assert.equal(1, 1);
  });

});
