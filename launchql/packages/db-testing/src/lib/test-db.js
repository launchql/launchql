import { getOpts, getConnection } from './testing';
import { setTemplate } from './utils';
import { close } from './connection';
import { droptemplatedb } from './db';
import env from '../env';

export class TestDatabase {
  constructor(options = {}) {
    this.options = options;
  }
  async init(extensions = []) {
    if (!env.PGTEMPLATE_DATABASE) {
      throw new Error('no PGTEMPLATE_DATABASE defined in env!');
    }
    this.config = await getOpts(this.options);
    if (!this.config.template) {
      const config = {
        ...this.config,
        extensions
      };
      const templatedb = await getConnection(config, env.PGTEMPLATE_DATABASE);
      close(templatedb);

      const { connectionParameters } = templatedb.client;
      this.templateConfig = connectionParameters;
      await setTemplate(this.config, this.templateConfig.database);
    }
  }
  async getConnection() {
    const db = await getConnection({
      ...this.config,
      template: this.templateConfig.database
    });
    return db;
  }
  async close() {
    await droptemplatedb(this.templateConfig);
  }
}
