// Auto-generated template module

export default [
(vars: Record<string, any>) => {
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
},

(vars: Record<string, any>) => {
  const relPath = `package.json`;
  const content = `{
  "name": "${vars.PACKAGE_IDENTIFIER}",
  "version": "0.0.1",
  "author": "${vars.USERFULLNAME} <${vars.USEREMAIL}>",
  "description": "${vars.MODULEDESC}",
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
    "lint": "eslint . --fix",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "keywords": [],
  "devDependencies": {
    "pgsql-test": "^2.12.2"
  },
  "pnpm": {
    "overrides": {
      "graphql": "14.7.0"
    }
  }
}`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
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
},

(vars: Record<string, any>) => {
  const relPath = `README.md`;
  const content = `# ${vars.MODULENAME}

<p align="center">
  <img src="https://raw.githubusercontent.com/launchql/launchql/refs/heads/main/assets/outline-logo.svg" width="250"><br />
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
pnpm install
# build the prod packages. When devs would like to navigate to the source code, this will only navigate from references to their definitions (.d.ts files) between packages.
pnpm run build
\`\`\`

Or if you want to make your dev process smoother, you can run:

\`\`\`sh
pnpm install
# build the dev packages with .map files, this enables navigation from references to their source code between packages.
pnpm run build:dev
\`\`\`

## Credits

🛠 Built by LaunchQL — if you like our tools, please checkout and contribute to [our github ⚛️](https://github.com/launchql)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `src/index.ts`;
  const content = `export default () => {

};`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `__tests__/first.test.ts`;
  const content = `import { getConnections, PgTestClient } from 'pgsql-test';

let db: PgTestClient;
let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, db, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await db.beforeEach();
});

afterEach(async () => {
  await db.afterEach();
});

describe('first test', () => {
  it('should pass', async () => {
    const result = await pg.query('SELECT 1 as num');
    expect(result.rows[0].num).toBe(1);
  });
});

`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
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
}
];