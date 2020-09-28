#!/usr/bin/env node

import app from './index';

app.listen(5678, () => {
  // eslint-disable-next-line
    console.log("Server: http://localhost:5678/graphiql");
});
