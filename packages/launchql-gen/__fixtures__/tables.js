export default [
  {
    name: 'test1',
    defn: {
      databaseId: '5b3263d5-13eb-491c-b397-7f227edd3cf2',
      name: 'products',
      id: 'a65d1d03-e302-41a9-11c9-18470c9d7f46',
      attributes: [
        {
          name: 'id',
          hasDefault: true,
          isHidden: false,
          isNotNull: true,
          type: { name: 'uuid' }
        },
        {
          name: 'owner_id',
          isHidden: false,
          hasDefault: true,
          isNotNull: true,
          type: { name: 'uuid' }
        },
        {
          name: 'name',
          isHidden: false,
          isNotNull: true,
          type: { name: 'text' }
        },
        {
          name: 'rhino_foot',
          description: null,
          isHidden: false,
          isNotNull: false,
          type: { name: 'text' }
        },
        {
          name: 'hidden_foot',
          description: null,
          isHidden: true,
          isNotNull: false,
          type: { name: 'text' }
        },
        {
          name: 'lizard_feet',
          isHidden: false,
          isNotNull: false,
          type: { name: 'text' }
        }
      ],
      primaryKeyConstraint: {
        keyAttributes: [
          {
            name: 'id',
            type: {
              name: 'uuid'
            },
            isIndexed: true,
            isUnique: true
          }
        ]
      }
    }
  }
];
