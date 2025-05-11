module.exports = {
  schema: 'my-schema',
  table: 'my-table',
  headers: ['zip', 'lat', 'lon', 'box'],
  fields: {
    zip: 'int',
    bbox: {
      type: 'bbox',
      from: 'box'
    },
    location: {
      type: 'location',
      from: ['lon', 'lat']
    }
  }
};
