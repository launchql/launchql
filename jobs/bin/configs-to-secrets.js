const promisify = require('util').promisify;
const exec = promisify(require('child_process').exec);

const namespace = process.argv[2];
const configmap = process.argv[3];

(async () => {
  const { stdout: result } = await exec(
    `kubectl get configmap ${configmap} -n ${namespace} --export -o jsonpath="{.data}"`
  );

  const vars = result.match(/^map\[(.*)\]$/);

  const cmd = [`kubectl create secret generic ${configmap} -n openfaas-fn`];
  const configs = vars[1].split(' ');
  configs.forEach((config) => {
    const [name, value] = config.replace(/:/, ' ').split(' ');
    cmd.push(`--from-literal=${name}=${value}`);
  });

  await exec(`kubectl delete secret ${configmap} -n openfaas-fn`);
  const { stdout: final } = await exec(cmd.join(' '));

  console.log(final);
})();
