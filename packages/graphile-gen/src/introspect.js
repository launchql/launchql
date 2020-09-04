export const introspect = (introspectron) => {
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

    for (let k = 0; k < klass.attributes.length; k++) {
      const attr = klass.attributes[k];

      console.log(attr);
    }

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

  // first create
  // createOne,

  // updateOne,
  // deleteOne,
  // getOne,
  // getMany,
  // getManyOwned,
};
