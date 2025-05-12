// Auto-generated template module

export const tsconfig_json = (vars: Record<string, any>) => {
  const relPath = `tsconfig.json`;
  const content = `{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src/"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules", "**/*.spec.*", "**/*.test.*"]
}
`;
  return { relPath, content };
};

export const tsconfig_esm_json = (vars: Record<string, any>) => {
  const relPath = `tsconfig.esm.json`;
  const content = `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist/esm",
    "module": "es2022",
    "rootDir": "src/",
    "declaration": false
  }
}
`;
  return { relPath, content };
};

export const package_json = (vars: Record<string, any>) => {
  const relPath = `package.json`;
  const content = `{
  "name": "${vars.PACKAGE_IDENTIFIER}",
  "version": "0.0.1",
  "author": "${vars.USERFULLNAME} <${vars.USEREMAIL}>",
  "description": "${vars.MODULEDESC}",
  "main": "index.js",
  "module": "esm/index.js",
  "types": "index.d.ts",
  "homepage": "https://github.com/${vars.USERNAME}/${vars.REPONAME}",
  "license": "SEE LICENSE IN LICENSE",
  "publishConfig": {
    "access": "${vars.ACCESS}",
    "directory": "dist"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/${vars.USERNAME}/${vars.REPONAME}"
  },
  "bugs": {
    "url": "https://github.com/${vars.USERNAME}/${vars.REPONAME}/issues"
  },
  "scripts": {
    "copy": "copyfiles -f ../../LICENSE README.md package.json dist",
    "clean": "rimraf dist/**",
    "prepare": "npm run build",
    "build": "npm run clean; tsc; tsc -p tsconfig.esm.json; npm run copy",
    "build:dev": "npm run clean; tsc --declarationMap; tsc -p tsconfig.esm.json; npm run copy",
    "lint": "eslint . --fix",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "keywords": []
}`;
  return { relPath, content };
};

export const jest_config_js = (vars: Record<string, any>) => {
  const relPath = `jest.config.js`;
  const content = `/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\\\.tsx?$": [
            "ts-jest",
            {
                babelConfig: false,
                tsconfig: "tsconfig.json",
            },
        ],
    },
    transformIgnorePatterns: [\`/node_modules/*\`],
    testRegex: "(/__tests__/.*|(\\\\.|/)(test|spec))\\\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    modulePathIgnorePatterns: ["dist/*"]
};
`;
  return { relPath, content };
};

export const README_md = (vars: Record<string, any>) => {
  const relPath = `README.md`;
  const content = `# ${vars.MODULENAME}

<p align="center">
  <img src="https://user-images.githubusercontent.com/545047/188804067-28e67e5e-0214-4449-ab04-2e0c564a6885.svg" width="80"><br />
    ${vars.MODULEDESC}
</p>

## install

\`\`\`sh
npm install ${vars.MODULENAME}
\`\`\`
## Table of contents

- [${vars.MODULENAME}](#${vars.MODULENAME})
  - [Install](#install)
  - [Table of contents](#table-of-contents)
- [Developing](#developing)
- [Credits](#credits)

## Developing

When first cloning the repo:

\`\`\`sh
yarn
# build the prod packages. When devs would like to navigate to the source code, this will only navigate from references to their definitions (.d.ts files) between packages.
yarn build
\`\`\`

Or if you want to make your dev process smoother, you can run:

\`\`\`sh
yarn
# build the dev packages with .map files, this enables navigation from references to their source code between packages.
yarn build:dev
\`\`\`

## Interchain JavaScript Stack 

A unified toolkit for building applications and smart contracts in the Interchain ecosystem ⚛️

| Category              | Tools                                                                                                                  | Description                                                                                           |
|----------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **Chain Information**   | [**Chain Registry**](https://github.com/hyperweb-io/chain-registry), [**Utils**](https://www.npmjs.com/package/@chain-registry/utils), [**Client**](https://www.npmjs.com/package/@chain-registry/client) | Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application. |
| **Wallet Connectors**| [**Interchain Kit**](https://github.com/hyperweb-io/interchain-kit)<sup>beta</sup>, [**Cosmos Kit**](https://github.com/hyperweb.io/cosmos-kit) | Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface. |
| **Signing Clients**          | [**InterchainJS**](https://github.com/hyperweb-io/interchainjs)<sup>beta</sup>, [**CosmJS**](https://github.com/cosmos/cosmjs) | A single, universal signing interface for any network |
| **SDK Clients**              | [**Telescope**](https://github.com/hyperweb.io/telescope)                                                          | Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules. |
| **Starter Kits**     | [**Create Interchain App**](https://github.com/hyperweb-io/create-interchain-app)<sup>beta</sup>, [**Create Cosmos App**](https://github.com/hyperweb.io/create-cosmos-app) | Set up a modern Interchain app by running one command. |
| **UI Kits**          | [**Interchain UI**](https://github.com/hyperweb.io/interchain-ui)                                                   | The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit. |
| **Testing Frameworks**          | [**Starship**](https://github.com/hyperweb.io/starship)                                                             | Unified Testing and Development for the Interchain. |
| **TypeScript Smart Contracts** | [**Create Hyperweb App**](https://github.com/hyperweb-io/create-hyperweb-app)                              | Build and deploy full-stack blockchain applications with TypeScript |
| **CosmWasm Contracts** | [**CosmWasm TS Codegen**](https://github.com/CosmWasm/ts-codegen)                                                   | Convert your CosmWasm smart contracts into dev-friendly TypeScript classes. |

## Credits

🛠 Built by Hyperweb (formerly Cosmology) — if you like our tools, please checkout and contribute to [our github ⚛️](https://github.com/hyperweb-io)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
`;
  return { relPath, content };
};

export const src_index_ts = (vars: Record<string, any>) => {
  const relPath = `src/index.ts`;
  const content = `export default () => {

};`;
  return { relPath, content };
};

export const tests_first_test_ts = (vars: Record<string, any>) => {
  const relPath = `__tests__/first.test.ts`;
  const content = `it('works', () => {
    console.log('hello test world!');
})`;
  return { relPath, content };
};

export const questions_json = (vars: Record<string, any>) => {
  const relPath = `.questions.json`;
  const content = `[
  {
    "name": "${vars.USERFULLNAME}",
    "message": "Enter author full name",
    "required": true
  },
  {
    "name": "${vars.USEREMAIL}",
    "message": "Enter author email",
    "required": true
  },
  {
    "name": "${vars.MODULENAME}",
    "message": "Enter the module name",
    "required": true
  },
  {
    "name": "${vars.MODULEDESC}",
    "message": "Enter the module description",
    "required": true
  },
  {
    "name": "${vars.REPONAME}",
    "message": "Enter the repository name",
    "required": true
  },
  {
    "name": "${vars.USERNAME}",
    "message": "Enter your github username",
    "required": true
  },
  {
    "name": "${vars.ACCESS}",
    "message": "Module access?",
    "choices": [
      "public",
      "restricted"
    ],
    "type": "list",
    "required": true
  }
]`;
  return { relPath, content };
};

export default {
  tsconfig_json,
  tsconfig_esm_json,
  package_json,
  jest_config_js,
  README_md,
  src_index_ts,
  tests_first_test_ts,
  questions_json
};