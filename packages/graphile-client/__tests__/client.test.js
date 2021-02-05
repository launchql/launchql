import mutations from '../__fixtures__/api/mutations.json';
import queries from '../__fixtures__/api/queries.json';
import {GraphileClient} from '../src';

it('generate', () => {
  const gen = new GraphileClient({ ...queries, ...mutations });
  
  const hash = gen.model('Action')
  .fields([
    'id',
    'name',
    'approved'
  ]).gen().hash;

  expect(hash).toMatchSnapshot();
});
