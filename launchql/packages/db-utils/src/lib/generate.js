export const generate = async ({templates, template, templatePath, payload}) => {

  var params = Object.keys(payload).reduce(
    (m, v) => {
      if (payload[v] instanceof Array) {
        payload[v].forEach((value) => {
          m.push({
            key: v,
            value: value,
          });
        });
      } else {
        if (typeof payload[v] === 'boolean' && !payload[v]) {
          return m;
        }
        m.push({
          key: v,
          value: payload[v],
        });
      }
      return m;
    },
    []
  );
  var vars = params.map(obj => `--set ${obj.key}="${obj.value}"`).join(' ');

  let change = templates[template].change(payload);

  var reqd = [];

  let reqs = templates[template]
    .requires(payload)
    .filter((req) => {
      if (reqd.includes(req.join('/'))) {
        return false;
      }
      reqd.push(req.join('/'));
      return true;
    })
    .map((req) => {
      return `-r ${req.join('/')}`;
    })
    .join(' ');

  change = change.join('/');
  if (!change || change === '' || change === '/') {
    throw new Error('no change found!');
  }

  const cmd = [
    'sqitch',
    'add',
    change,
    '--template',
    template,
    '--template-directory',
    templatePath,
    '-n',
    `'add ${change}'`,
    vars,
    reqs,
  ].join(' ');

  return cmd;
};
