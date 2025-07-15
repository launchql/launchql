import { TestFixture } from '../../test-utils';

let fixture: TestFixture;

beforeAll(() => {
  fixture = new TestFixture('sqitch');
});

afterAll(() => {
  fixture.cleanup();
});

it('getModuleExtensions for my-first', () => {
  const project = fixture.getModuleProject(['simple'], 'my-first');
  expect(project.getModuleExtensions()).toMatchSnapshot();
});

it('getModuleExtensions for my-second', () => {
  const project = fixture.getModuleProject(['simple'], 'my-second');
  expect(project.getModuleExtensions()).toMatchSnapshot();
});

it('getModuleExtensions for my-third', () => {
  const project = fixture.getModuleProject(['simple'], 'my-third');
  expect(project.getModuleExtensions()).toMatchSnapshot();
});

it('getModuleDependencies for my-third', () => {
  const project = fixture.getModuleProject(['simple'], 'my-third');

  // console.log(project.getAvailableModules());
  // console.log(project.getModuleMap());
  // console.log(project.getModuleExtensions());

  expect(project.getModuleDependencies('my-third')).toMatchSnapshot();
});
