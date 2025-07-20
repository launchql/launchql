import { TestPlan } from '../../../test-utils';

it('plan-invalid/bad-symbolic-refs.plan', () => {
  const testPlan = new TestPlan('plan-invalid/bad-symbolic-refs.plan');
  expect(testPlan.result.errors).toMatchSnapshot();
});

it('plan-invalid/invalid-change-names.plan', () => {
  const testPlan = new TestPlan('plan-invalid/invalid-change-names.plan');
  expect(testPlan.result.errors).toMatchSnapshot();
});

it('plan-invalid/invalid-tag-names.plan', () => {
  const testPlan = new TestPlan('plan-invalid/invalid-tag-names.plan');
  expect(testPlan.result.errors).toMatchSnapshot();
});