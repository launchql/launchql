import { prompt } from 'inquirerer';
import { getConfig, setConfig } from '../../env';
import { makeAutocompleteFunctionWithInput as makeSearch } from '@launchql/db-utils';

export default async (ctx, args) => {
  const config = await getConfig();

  console.log(config);
  const { user, auth } = await prompt(
    [
      {
        _: true,
        type: 'string',
        name: 'user',
        message: 'enter a user name',
        required: true
      },
      {
        type: 'autocomplete',
        name: 'auth',
        message: 'enter an auth method',
        source: makeSearch(['basic', 'token', 'none']),
        required: true
      }
    ],
    args
  );

  console.log(user, auth);

  let props = {};
  console.log({ auth });
  if (auth === 'basic') {
    const { username, password } = await prompt(
      [
        {
          type: 'string',
          name: 'username',
          message: 'enter username',
          required: true
        },
        {
          type: 'password',
          name: 'password',
          message: 'enter password',
          required: true
        }
      ],
      args
    );
    props = {
      username,
      password
    };
  } else if (auth === 'token') {
    const { accessToken, refreshToken } = await prompt(
      [
        {
          type: 'password',
          name: 'accessToken',
          message: 'enter accessToken',
          required: true
        },
        {
          type: 'password',
          name: 'refreshToken',
          message: 'enter refreshToken',
          required: true
        }
      ],
      args
    );
    props = {
      accessToken,
      refreshToken
    };
  }

  config.users.push({
    name: user,
    auth:
      auth === 'none'
        ? undefined
        : {
            type: auth,
            ...props
          }
  });

  await setConfig(config);

  console.log(`added ${user}`);
};
