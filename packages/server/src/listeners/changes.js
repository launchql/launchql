const listenForChanges = (err, client, release) => {
  if (err) {
    console.error('Error connecting with notify listener', err);
    // Try again in 5 seconds
    // should this really be done in the node process?
    setTimeout(this.listen, 5000);
    return;
  }
  client.on('notification', () => {
    if (this.doNextTimer) {
      // Must be idle, do something!
      this.doNext(client);
    }
  });
  client.query('LISTEN "jobs:insert"');
  client.on('error', (e) => {
    console.error('Error with database notify listener', e);
    release();
    this.listen();
  });
  console.log(`${this.workerId} connected and looking for jobs...`);
  this.doNext(client);
};
export const listen = (pgPool) => {
  pgPool.connect(listenForChanges);
};
