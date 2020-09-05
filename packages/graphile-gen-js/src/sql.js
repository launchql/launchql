import { pg } from 'graphile-gen';
import { generateJS } from './utils';

export const crudify = (introspectron) => {
  const val = pg.crudify(introspectron);
  return Object.keys(val).reduce((m, key) => {
    m[key] = generateJS({ name: key, ast: val[key] });
    return m;
  }, {});
};

export const owned = (introspectron) => {
  const val = pg.owned(introspectron);
  return Object.keys(val).reduce((m, key) => {
    m[key] = generateJS(val[key]);
    return m;
  }, {});
};

export const updateOne = (defn) => {
  const val = pg.updateOne(defn);
  return generateJS(val);
};

export const createOne = (defn) => {
  const val = pg.createOne(defn);
  return generateJS(val);
};

export const deleteOne = (defn) => {
  const val = pg.deleteOne(defn);
  return generateJS(val);
};

export const getOne = (defn) => {
  const val = pg.getOne(defn);
  return generateJS(val);
};

export const getMany = (defn) => {
  const val = pg.getMany(defn);
  return generateJS(val);
};

export const getManyOwned = (defn, ownedKey) => {
  const val = pg.getManyOwned(defn, ownedKey);
  return generateJS(val);
};
