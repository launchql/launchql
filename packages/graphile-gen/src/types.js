export function getType(type) {
  // TODO look in postgraphile
  switch (type) {
    case 'uuid':
      return 'UUID';
    case 'json':
    case 'jsonb':
      return 'JSON';
    case 'numeric':
      return 'BigFloat';
    case 'int':
    case 'integer':
      return 'Int';
    case 'upload':
    case 'attachment':
    case 'image':
      return 'Upload';
    case 'text':
    default:
      return 'String';
  }
}
