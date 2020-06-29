export const aliases = ['v'];
// in production path is one step up...
const version = require('../../../package.json').version;
export default async argv => {
  console.log(version);
};
