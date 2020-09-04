import {
  updateOne,
  createOne,
  deleteOne,
  getOne,
  getMany,
  getManyOwned
} from '../src';
import cases from 'jest-in-case';
import { print } from 'graphql';
import tables from '../__fixtures__/tables';
const introspectron = JSON.parse(
  require('fs')
    .readFileSync(__dirname + '/../__fixtures__/introspectron.json')
    .toString()
);

const namespaces = introspectron.namespace.map((n) => n.name);
console.log(namespaces);
const classes = introspectron.class.filter((c) =>
  namespaces.includes(c.namespaceName)
);
console.log(classes.map((c) => c.name));

for (let c = 0; c < classes.length; c++) {
  const klass = classes[c];
  console.log(
    klass.attributes?.map((k) => k.name) ||
      `klass ${klass.name} has no attributes`
  );
  console.log(
    klass.constraints?.map((k) => k.name) ||
      `klass ${klass.name} has no constriants`
  );

  for (let k = 0; k < klass.constraints.length; k++) {
    const konstraint = klass.constraints[k];
    console.log(
      konstraint.keyAttributes?.map((k) => k.name) ||
        `klass ${konstraint.name} has no keyAttrs`
    );
  }
  console.log(
    klass.foreignConstraints?.map((k) => k.name) ||
      `klass ${klass.name} has no foreign`
  );
  console.log(
    klass.primaryKeyConstraint?.name || `klass ${klass.name} has no primary`
  );
}

cases(
  'getOne',
  (options) => {
    const { ast } = getOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'getMany',
  (options) => {
    const { ast } = getMany(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'getManyOwned',
  (options) => {
    const { ast } = getManyOwned(options.defn, 'owner_id');
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'updateOne',
  (options) => {
    const { ast } = updateOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'createOne',
  (options) => {
    const { ast } = createOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);

cases(
  'deleteOne',
  (options) => {
    const { ast } = deleteOne(options.defn);
    expect(print(ast)).toMatchSnapshot();
  },
  tables
);
