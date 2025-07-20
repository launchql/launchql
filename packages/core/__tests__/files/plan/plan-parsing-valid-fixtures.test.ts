import { TestPlan } from '../../../test-utils';

it('plan-valid/project-qualified.plan', () => {
  const testPlan = new TestPlan('plan-valid/project-qualified.plan');
  expect(testPlan.result.errors.length).toBe(0);
});

it('plan-valid/relative-head-root.plan', () => {
  const testPlan = new TestPlan('plan-valid/relative-head-root.plan');
  expect(testPlan.result.errors.length).toBe(0);
});

it('plan-valid/sha1-refs.plan', () => {
  const testPlan = new TestPlan('plan-valid/sha1-refs.plan');
  expect(testPlan.result.errors.length).toBe(0);
});

it('plan-valid/symbolic-head-root.plan', () => {
  const testPlan = new TestPlan('plan-valid/symbolic-head-root.plan');
  expect(testPlan.result.errors.length).toBe(0);
});

it('plan-valid/valid-change-names.plan', () => {
  const testPlan = new TestPlan('plan-valid/valid-change-names.plan');
  expect(testPlan.result.errors.length).toBe(0);
});

it('plan-valid/valid-tag-names.plan', () => {
  const testPlan = new TestPlan('plan-valid/valid-tag-names.plan');
  expect(testPlan.result.errors.length).toBe(0);
});