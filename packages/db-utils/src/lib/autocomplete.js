import { filter } from 'fuzzy';

export const makeAutocompleteFunctionWithInput = (keys) => (answers, input) => {
  input = input || '';
  return new Promise(function(resolve) {
    setTimeout(function() {
      var fuzzyResult = filter(input, keys);
      resolve(
        fuzzyResult.map(function(el) {
          return el.original;
        })
      );
    }, 25);
  });
};
