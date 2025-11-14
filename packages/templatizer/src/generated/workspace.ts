// Auto-generated template module

export default [
(vars: Record<string, any>) => {
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
},

(vars: Record<string, any>) => {
  const relPath = `pnpm-workspace.yaml`;
  const content = `packages:
  - 'packages/*'
`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
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
    "lint": "pnpm -r run lint"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "@types/node": "^22.10.2",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "eslint": "^9.13.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "eslint-plugin-unused-imports": "^4.3.0",
    "jest": "^29.7.0",
    "lerna": "^8.2.4",
    "pgsql-test": "^2.13.2",
    "prettier": "^3.3.3",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.3"
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
  const relPath = `lerna.json`;
  const content = `{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "version": "independent",
  "npmClient": "pnpm",
  "npmClientArgs": [
    "--frozen-lockfile"
  ],
  "packages": [
    "packages/*"
  ],
  "registry": "https://registry.npmjs.org",
  "command": {
    "create": {
      "homepage": "https://github.com/${vars.USERNAME}/${vars.MODULENAME}",
      "license": "SEE LICENSE IN LICENSE",
      "access": "restricted"
    },
    "publish": {
      "allowBranch": "main",
      "message": "chore(release): publish",
      "conventionalCommits": true
    }
  }
}`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `launchql.json`;
  const content = `{
  "packages": [
    "packages/*",
    "extensions/*"
  ]
}`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `docker-compose.yml`;
  const content = `services:
  postgres:
    container_name: postgres
    image: pyramation/pgvector:13.3-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    expose:
      - "5432"
    volumes:
      - ./bin:/sql-bin
      - ./packages:/sql-packages
      - ./extensions:/sql-extensions

  minio:
    container_name: minio
    image: minio/minio
    environment:
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
    ports:
      - "9000:9000"
    expose:
      - "9000"
    command: server /data
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

## Developing

\`\`\`sh
docker-compose up
pnpm install
cd packages/your-module
pnpm test:watch
\`\`\`

## Credits

🛠 Built by LaunchQL — checkout [our github ⚛️](https://github.com/launchql)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `Makefile`;
  const content = `
up:
	docker-compose up -d

down:
	docker-compose down -v

ssh:
	docker exec -it postgres /bin/bash

roles:
	lql admin-users bootstrap --yes
	lql admin-users add --test --yes

install:
	docker exec postgres /sql-bin/install.sh
`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `LICENSE`;
  const content = `The MIT License (MIT)

Copyright (c) 2025 ${vars.USERFULLNAME} <${vars.USEREMAIL}>

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
},

(vars: Record<string, any>) => {
  const relPath = `bin/install.sh`;
  const content = `#!/usr/bin/env bash
set -euo pipefail

# Define colors and styles
GREEN="\\033[0;32m"
BOLD="\\033[1m"
RESET="\\033[0m"
CYAN="\\033[0;36m"
YELLOW="\\033[1;33m"

install_sql_modules() {
  local base_dir="$1"
  local label
  label=$(basename "$base_dir")

  if [[ ! -d "$base_dir" ]]; then
    echo -e "\${YELLOW}Warning:\${RESET} SQL module directory '\${CYAN}\${base_dir}\${RESET}' does not exist. Skipping..."
    return
  fi

  echo -e "\${GREEN}Installing SQL modules from:\${RESET} \${CYAN}\${base_dir}\${RESET}"
  find "$base_dir" -type f -name "sqitch.plan" | while read -r plan_file; do
    local dir rel_path pkg_name
    dir=$(dirname "$plan_file")
    rel_path="\${dir#"$base_dir"/}"         # strip base_dir prefix
    pkg_name="\${BOLD}\${GREEN}\${rel_path}\${RESET}" # colorize and bold package name
    echo -e "\${CYAN}→ Installing in:\${RESET} \${pkg_name}"
    (cd "$dir" && make install)
  done
}

install_sql_modules "/sql-extensions"
install_sql_modules "/sql-packages"
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
    "message": "Enter the workspace name",
    "required": true
  },
  {
    "name": "${vars.MODULEDESC}",
    "message": "Enter the workspace description",
    "required": false
  },
  {
    "name": "${vars.USERNAME}",
    "message": "Enter your github username",
    "required": true
  }
]
`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `.prettierrc.json`;
  const content = `{
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "useTabs": false,
  "singleQuote": false
}`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
  const relPath = `.gitignore`;
  const content = `**/node_modules/
**/.DS_Store
**/dist
**/pnpm-debug.log
lerna-debug.log`;
  return { relPath, content };
},

(vars: Record<string, any>) => {
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
}
];