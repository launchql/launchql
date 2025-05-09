export const requires = (res) => [

];

export const change = ({
  extension,
}) => [
  'extensions',
  extension
];

const questions = [
  {
    type: 'string',
    name: 'extension',
    message: 'enter a extension name',
    required: true,
  }
];

export default questions;
