// Auto-generated template module

export const tsconfig_json = (vars: Record<string, any>) => {
  const relPath = `tsconfig.json`;
  const content = `{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "strictNullChecks": false,
    "skipLibCheck": true,
    "sourceMap": false,
    "declaration": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "exclude": ["dist", "node_modules"]
}
`;
  return { relPath, content };
};

export const package_json = (vars: Record<string, any>) => {
  const relPath = `package.json`;
  const content = `{
  "name": "${vars.MODULENAME}",
  "version": "0.0.1",
  "author": "${vars.USERFULLNAME} <${vars.USEREMAIL}>",
  "private": true,
  "repository": {
    "type": "git",
    "url": "https://github.com/${vars.USERNAME}/${vars.MODULENAME}"
  },
  "license": "SEE LICENSE IN LICENSE",
  "publishConfig": {
    "access": "restricted"
  },
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "clean": "lerna run clean",
    "build": "lerna run build --stream",
    "build:dev": "lerna run build:dev --stream; yarn symlink",
    "lint": "lerna run lint --parallel",
    "symlink": "symlink-workspace --logLevel error",
    "postinstall": "yarn symlink"
  },
  "devDependencies": {
    "@types/jest": "^29.5.11",
    "@types/node": "^20.12.7",
    "@typescript-eslint/eslint-plugin": "^7.10.0",
    "@typescript-eslint/parser": "^7.10.0",
    "copyfiles": "^2.4.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-simple-import-sort": "^12.1.0",
    "eslint-plugin-unused-imports": "^4.0.0",
    "eslint": "^8.56.0",
    "jest": "^29.6.2",
    "lerna": "^6",
    "prettier": "^3.0.2",
    "rimraf": "4.4.1",
    "strip-ansi": "^6",
    "symlink-workspace": "^1.9.0",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.1.6"
  }
}`;
  return { relPath, content };
};

export const lerna_json = (vars: Record<string, any>) => {
  const relPath = `lerna.json`;
  const content = `{
  "lerna": "6",
  "conventionalCommits": true,
  "npmClient": "yarn",
  "npmClientArgs": [
    "--no-lockfile"
  ],
  "packages": [
    "packages/*"
  ],
  "version": "independent",
  "registry": "https://registry.npmjs.org",
  "command": {
    "create": {
      "homepage": "https://github.com/${vars.USERNAME}/${vars.MODULENAME}",
      "license": "SEE LICENSE IN LICENSE",
      "access": "restricted"
    },
    "publish": {
      "allowBranch": "main",
      "message": "chore(release): publish"
    }
  }
}`;
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

export const LICENSE = (vars: Record<string, any>) => {
  const relPath = `LICENSE`;
  const content = `The MIT License (MIT)

Copyright (c) 2024 ${vars.USERFULLNAME} <${vars.USEREMAIL}>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
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
    "name": "${vars.USERNAME}",
    "message": "Enter your github username",
    "required": true
  }
]`;
  return { relPath, content };
};

export const prettierrc_json = (vars: Record<string, any>) => {
  const relPath = `.prettierrc.json`;
  const content = `{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "useTabs": false,
  "singleQuote": false
}`;
  return { relPath, content };
};

export const gitignore = (vars: Record<string, any>) => {
  const relPath = `.gitignore`;
  const content = `**/node_modules/
**/.DS_Store
**/dist
**/yarn-error.log
lerna-debug.log`;
  return { relPath, content };
};

export const eslintrc_json = (vars: Record<string, any>) => {
  const relPath = `.eslintrc.json`;
  const content = `{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "overrides": [],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "simple-import-sort",
    "unused-imports"
  ],
  "rules": {
    "indent": [
      "error",
      2
    ],
    "quotes": [
      "error",
      "single",
      {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ],
    "quote-props": [
      "error",
      "as-needed"
    ],
    "semi": [
      "error",
      "always"
    ],
    "simple-import-sort/imports": 1,
    "simple-import-sort/exports": 1,
    "unused-imports/no-unused-imports": 1,
    "@typescript-eslint/no-unused-vars": [
      1,
      {
        "argsIgnorePattern": "React|res|next|^_"
      }
    ],
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-var-requires": 0,
    "no-console": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "prefer-const": 0,
    "no-case-declarations": 0,
    "no-implicit-globals": 0,
    "@typescript-eslint/no-unsafe-declaration-merging": 0
  }
}`;
  return { relPath, content };
};

export default {
  tsconfig_json,
  package_json,
  lerna_json,
  README_md,
  LICENSE,
  questions_json,
  prettierrc_json,
  gitignore,
  eslintrc_json
};