import { Inquirerer, Question } from 'inquirerer';

import { KEY_SEQUENCES, setupTests, TestEnvironment } from '../test-utils';

const beforeEachSetup = setupTests();

describe('Inquirerer', () => {
  let environment: TestEnvironment;

  beforeEach(() => {
    environment = beforeEachSetup();
  });

  it('prompts user and correctly processes delayed input', async () => {
    const { mockInput, mockOutput, writeResults, transformResults, enqueueInputResponse } = environment;

    const prompter = new Inquirerer({
      input: mockInput,
      output: mockOutput,
      noTty: false
    });

    const questions: Question[] = [{
      name: 'autocompleteField',
      type: 'autocomplete',
      options: ['first option', 'firry second option', 'firry third option']
    }];

    const argv = {};

    enqueueInputResponse({ type: 'read', value: 'fir' });
    enqueueInputResponse({ type: 'key', value: KEY_SEQUENCES.DOWN_ARROW });
    enqueueInputResponse({ type: 'key', value: KEY_SEQUENCES.DOWN_ARROW });
    enqueueInputResponse({ type: 'key', value: KEY_SEQUENCES.ENTER });

    const result = await prompter.prompt(argv, questions);

    expect(argv).toMatchSnapshot();
    expect(result).toMatchSnapshot();
    expect(writeResults).toMatchSnapshot();
    expect(transformResults).toMatchSnapshot();
  });
});
