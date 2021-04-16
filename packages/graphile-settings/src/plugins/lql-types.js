export default function (builder) {
  builder.hook('build', (_, build) => {
    [
      //   {
      //     name: 'attachment',
      //     namespaceName: 'public',
      //     type: 'JSON'
      //   },
      //   {
      //     name: 'image',
      //     namespaceName: 'public',
      //     type: 'JSON'
      //   },
      //   {
      //     name: 'upload',
      //     namespaceName: 'public',
      //     type: 'String'
      //   },
      // BUG: DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
      // NOTE: this bug only happens for image, attachment, and upload since they are already overridden in another plugin, for now just don't rename those...

      {
        name: 'email',
        namespaceName: 'public',
        type: 'String'
      },
      {
        name: 'hostname',
        namespaceName: 'public',
        type: 'String'
      },
      {
        name: 'multiple_select',
        namespaceName: 'public',
        type: 'JSON'
      },
      {
        name: 'single_select',
        namespaceName: 'public',
        type: 'JSON'
      },
      {
        name: 'origin',
        namespaceName: 'public',
        type: 'String'
      },
      {
        name: 'url',
        namespaceName: 'public',
        type: 'String'
      }
    ].forEach(({ name, namespaceName, type }) => {
      const theType = build.pgIntrospectionResultsByKind.type.find(
        (typ) => typ.name === name && typ.namespaceName === namespaceName
      );
      if (theType) {
        build.pgRegisterGqlTypeByTypeId(theType.id, () =>
          build.getTypeByName(type)
        );
      }
    });
    return _;
  });
}
