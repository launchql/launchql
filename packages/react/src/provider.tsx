// @ts-nocheck
import React from 'react';
import { getLqlContext } from './context';

export const LqlProvider = ({ endpointUrl, children }) => {
  const LqlContext = getLqlContext();
  return (
    <LqlContext.Consumer>
      {(context = {}) => {
        if (endpointUrl && context.endpointUrl !== endpointUrl) {
          context = Object.assign({}, context, { endpointUrl });
        }
        if (!context.endpointUrl) {
          throw new Error(
            'LqlProvider was not passed endpointUrl: ' + JSON.stringify(context)
          );
        }

        return (
          <LqlContext.Provider value={context}>{children}</LqlContext.Provider>
        );
      }}
    </LqlContext.Consumer>
  );
};
