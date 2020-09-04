import * as gen from 'graphile-gen';
import { print } from 'graphql/language';

export const updateOne = (defn) => {
  return print(gen.updateOne(defn));
};

export const createOne = (defn) => {
  return print(gen.createOne(defn));
};

export const deleteOne = (defn) => {
  return print(gen.deleteOne(defn));
};

export const getOne = (defn) => {
  return print(gen.getOne(defn));
};

export const getMany = (defn) => {
  return print(gen.getMany(defn));
};

export const getManyOwned = (defn, ownedKey) => {
  return print(gen.getManyOwned(defn, ownedKey));
};
