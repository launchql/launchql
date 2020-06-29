import { prompt } from 'inquirerer';
import cmds from './index';
import aliases from './aliases';
import { makeAutocompleteFunctionWithInput } from '@launchql/db-utils';

export const searchCmds = makeAutocompleteFunctionWithInput(Object.keys(cmds));

const cmdQuestion = [
  {
    _: true,
    type: 'autocomplete',
    name: 'cmd',
    message: 'what do you want to do?',
    source: searchCmds
  }
];

export const skitch = async (argv) => {
  var { cmd } = await prompt(cmdQuestion, argv);
  if (!cmds.hasOwnProperty(cmd)) {
    Object.keys(aliases).forEach((aliasCmd) => {
      if (
        aliases[aliasCmd] &&
        aliases[aliasCmd].length &&
        aliases[aliasCmd].includes(cmd)
      ) {
        cmd = aliasCmd;
      }
    });
    if (!cmds.hasOwnProperty(cmd)) {
      throw new Error(`${cmd} does not exist!`);
    }
  }
  await cmds[cmd](argv);
};
