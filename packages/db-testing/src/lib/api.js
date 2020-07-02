import { wrapConn } from './helpers';
import { getConnections as getConns } from './testing';

let db, conn;
const psqlIds = (array) => {
  return `{${array.join(',')}}`;
};

export const getApi = async ([pub, priv]) => {
  ({ db, conn } = await getConns());

  const api = {
    public: wrapConn(conn, pub),
    private: wrapConn(conn, priv)
  };
  const admin = {
    public: wrapConn(db, pub),
    private: wrapConn(db, priv)
  };

  // TODO don't hardcode this:
  const auth = (userId) => {
    conn.setContext({
      role: 'authenticated',
      'jwt.claims.role_id': userId,
      'jwt.claims.role_ids': psqlIds([userId])
    });
  };

  return { api, admin, db, conn, auth };
};
