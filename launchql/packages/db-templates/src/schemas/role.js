export const requires = (res) => [];

export const change = ({ role }) => [
  'roles',
  role,
  'role',
];

const questions = [
  {
    type: 'string',
    name: 'role',
    message: 'enter a role name',
    required: true,
  },
];

export default questions;
