import React from 'react';

export const useReactNative =
  typeof WeakMap === 'function' &&
  !(typeof navigator === 'object' && navigator.product === 'ReactNative');

const cache = new (useReactNative ? WeakMap : Map)();

export function getLqlContext() {
  let context = cache.get(React.createContext);
  if (!context) {
    context = React.createContext({});
    context.displayName = 'LqlContext';
    cache.set(React.createContext, context);
  }
  return context;
}

export { getLqlContext as resetLqlContext };
