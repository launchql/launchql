import { rejects } from 'assert';
import csv from 'csv-parser';
import { createReadStream } from 'fs';

export const parse = (path) =>
  new Promise((resolve, reject) => {
    const results = [];
    createReadStream(path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('error', (er) => {
        reject(er);
      })
      .on('end', () => {
        resolve(results);
      });
  });
