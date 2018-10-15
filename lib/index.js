const createHash = require('crypto').createHash;

const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
module.exports.DNS = DNS;
module.exports.URL = URL;

const convertToBuffer = bytes => {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === 'string') {
    bytes = Buffer.from(bytes, 'utf8');
  }

  return bytes;
};

function uuidToBytes(uuid) {
  var bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, function (hex) {
    bytes.push(parseInt(hex, 16));
  });
  return bytes;
}

var hex = [];

for (var i = 0; i < 256; i++) {
  hex[i] = (i < 16 ? '0' : '') + i.toString(16);
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));

  return bytes;
}

class UuidHash {
  constructor(namespace = URL, version = 0x50) {
    this.version = version;
    this.namespace = namespace;
    this.shasum = createHash('sha1');
    this.shasum.update(convertToBuffer(this.namespace));
    if (typeof this.namespace == 'string') this.namespace = uuidToBytes(this.namespace);
    if (!Array.isArray(this.namespace) || this.namespace.length !== 16) throw new Error('namespace must be uuid string or an Array of 16 byte values');
  }

  update(chunk) {
    this.shasum.update(convertToBuffer(chunk));
    return this;
  }

  digest() {
    var r = hexToBytes(this.shasum.digest('hex'));
    r[6] = r[6] & 0x0f | this.version;
    r[8] = r[8] & 0x3f | 0x80;
    return hex[r[0]] + hex[r[1]] + hex[r[2]] + hex[r[3]] + '-' + hex[r[4]] + hex[r[5]] + '-' + hex[r[6]] + hex[r[7]] + '-' + hex[r[8]] + hex[r[9]] + '-' + hex[r[10]] + hex[r[11]] + hex[r[12]] + hex[r[13]] + hex[r[14]] + hex[r[15]];
  }

}

module.exports = UuidHash;

module.exports.createHash = (...args) => {
  return new UuidHash(...args);
};