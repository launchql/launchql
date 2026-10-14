import { Server } from '@constructive-io/graphql-server';
import { EventEmitter } from 'events';
import type { PoolClient } from 'pg';

class FakeClient extends EventEmitter {
  queries: string[] = [];
  queryResult: Promise<unknown> = Promise.resolve({ rows: [] });

  query(sql: string): Promise<unknown> {
    this.queries.push(sql);
    return this.queryResult;
  }
}

const asPoolClient = (client: FakeClient): PoolClient => client as unknown as PoolClient;

const createServer = () => {
  const server = new Server({ pg: { database: 'notify_listener_test' } });
  const reconnects: number[] = [];
  jest.spyOn(server, 'addEventListener').mockImplementation(() => {
    reconnects.push(Date.now());
  });
  return { server, reconnects };
};

describe('notify listener', () => {
  it('attaches the error handler before issuing the LISTEN', () => {
    const { server } = createServer();
    const client = new FakeClient();
    const listenerCounts: number[] = [];
    jest.spyOn(client, 'query').mockImplementation((sql: string) => {
      listenerCounts.push(client.listenerCount('error'));
      client.queries.push(sql);
      return Promise.resolve({ rows: [] });
    });

    server.listenForChanges(null, asPoolClient(client), () => {});

    expect(client.queries).toEqual(['LISTEN "schema:update"']);
    expect(listenerCounts).toEqual([1]);
  });

  it('releases and reconnects when the connection drops', () => {
    const { server, reconnects } = createServer();
    const client = new FakeClient();
    let released = 0;

    server.listenForChanges(null, asPoolClient(client), () => {
      released += 1;
    });
    client.emit('error', new Error('Connection terminated unexpectedly'));

    expect(released).toBe(1);
    expect(reconnects).toHaveLength(1);
    expect(client.listenerCount('error')).toBe(0);
  });

  it('tears down only once when the connection drops repeatedly', () => {
    const { server, reconnects } = createServer();
    const client = new FakeClient();
    let released = 0;

    server.listenForChanges(null, asPoolClient(client), () => {
      released += 1;
    });
    const onError = client.listeners('error')[0] as (e: Error) => void;
    onError(new Error('first'));
    onError(new Error('second'));

    expect(released).toBe(1);
    expect(reconnects).toHaveLength(1);
  });

  it('observes a failing LISTEN and reconnects', async () => {
    const { server, reconnects } = createServer();
    const client = new FakeClient();
    client.queryResult = Promise.reject(new Error('LISTEN failed'));
    let released = 0;

    server.listenForChanges(null, asPoolClient(client), () => {
      released += 1;
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(released).toBe(1);
    expect(reconnects).toHaveLength(1);
  });
});
