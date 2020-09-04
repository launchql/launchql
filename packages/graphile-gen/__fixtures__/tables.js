export default [
  {
    name: 'test1',
    defn: {
      databaseId: '5b3263d5-13eb-491c-b397-7f227edd3cf2',
      name: 'products',
      id: 'a65d1d03-e302-41a9-11c9-18470c9d7f46',
      fields: {
        nodes: [
          {
            name: 'id',
            defaultValue: 'uuid_generate_v4()',
            isHidden: false,
            isRequired: true,
            type: 'uuid'
          },
          {
            name: 'owner_id',
            isHidden: false,
            defaultValue: 'get_current_user_id()',
            isRequired: true,
            type: 'uuid'
          },
          {
            name: 'name',
            isHidden: false,
            isRequired: true,
            type: 'text'
          },
          {
            name: 'rhino_foot',
            description: null,
            isHidden: false,
            isRequired: false,
            type: 'text'
          },
          {
            name: 'hidden_foot',
            description: null,
            isHidden: true,
            isRequired: false,
            type: 'text'
          },
          {
            name: 'lizard_feet',
            isHidden: false,
            isRequired: false,
            type: 'text'
          }
        ]
      }
    }
  }
];
