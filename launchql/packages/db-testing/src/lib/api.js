import { wrapConn } from './helpers';
import { getConnections as getConns } from './testing';

export const getApi = async ([pub, priv]) => {
  const { db, conn, teardown } = await getConns();
  const api = {
    public: wrapConn(conn, pub),
    private: wrapConn(conn, priv)
  };
  const admin = {
    public: wrapConn(db, pub),
    private: wrapConn(db, priv)
  };
  return { api, admin, db, conn, teardown };
};
