// Real locked packages, no database and no rejection-suppression handlers.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const {createServer} = require('node:http');
const req = createRequire(path.resolve(__dirname, '../../../package.json'));
const {postgraphile} = req('postgraphile');
const {PostGraphileAmberPreset} = req('postgraphile/presets/amber');
const {grafserv} = req('grafserv/express/v4');
const express = req('express');
const ts = req('typescript');
const scenario = process.argv[2];
const exportsObject = {};
new Function('exports', ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../../utils/build-readiness.ts'), 'utf8'), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText)(exportsObject);
const {awaitGraphileBuildReadiness} = exportsObject;
function deferred() { let resolve, reject; const promise = new Promise((res, rej) => {resolve=res;reject=rej;}); return {promise,resolve,reject}; }
const turn = () => new Promise(resolve => setImmediate(resolve));
async function main() {
  const events = [];
  const schema = deferred(), attachment = deferred(), config = deferred(), retried = deferred();
  const schemaError = new Error('SCHEMA_SENTINEL');
  const attachmentError = new Error('ATTACHMENT_SENTINEL');
  let attempts = 0;
  let schemaBuilds = 0;
  let triggerWatch;
  let watcherStopped = false;
  const watch = scenario.startsWith('watch-');
  const pgl = postgraphile({
    extends: [PostGraphileAmberPreset], pgServices: [], grafserv: {watch},
    schema: {retryOnInitFail: scenario === 'watch-retry-success'},
    plugins: [{
      name: 'SequentialReadinessGate', version: '0.0.0',
      gather: {
        namespace: 'sequentialReadiness',
        initialCache() {events.push('schema:start');return {};},
        async watch(_context, onChange) {
          events.push('watch:start');
          triggerWatch = onChange;
          if (scenario === 'watch-setup-failure') throw new Error('WATCH_SETUP_SENTINEL');
          return () => {watcherStopped=true;events.push('watch:stop');};
        },
        async main() {
          events.push('schema:gather');
          attempts++;
          if (scenario === 'watch-retry-success' && attempts > 1) {retried.resolve();return;}
          await schema.promise;
        },
      },
      schema: {
        hooks: {
          GraphQLSchema(value) {
            schemaBuilds++;
            if (scenario === 'watch-schema-failure' ||
              (scenario === 'watch-schema-recovery' && schemaBuilds === 1)) {
              throw new Error('WATCH_SCHEMA_SENTINEL');
            }
            return value;
          },
        },
      },
      grafserv: {
        middleware: {
          async setPreset(next) {events.push('config:start');await config.promise;events.push('config:done');return next();},
        },
      },
    }],
  });
  assert.deepEqual(events, ['schema:start']);
  let serv;
  const app=express(), server=createServer(app);
  let settled=false;
  const result=awaitGraphileBuildReadiness({
    schemaResult: async () => {events.push('schema:get');await pgl.getSchemaResult();events.push('schema:done');},
    addTo: async () => {
      events.push('createServ');
      serv=pgl.createServ(grafserv);
      events.push('addTo:start');
      await attachment.promise;
      await serv.addTo(app,server);
      events.push('addTo:done');
    },
    ready: async () => {events.push('ready:start');await serv.ready();events.push('ready:done');},
    release: async () => {events.push('release');await pgl.release();},
  }).then(() => {settled=true;return {success:true};},error => {settled=true;return {error};});
  await turn();
  if (watch) assert(events.includes('watch:start'));
  assert(events.includes('schema:get'));
  assert(!events.includes('createServ'));
  assert(!events.includes('config:start'));

  if (scenario === 'watch-gather-failure' || scenario === 'watch-schema-failure') {
    if (scenario === 'watch-gather-failure') schema.reject(schemaError);
    else schema.resolve();
    await turn();await turn();
    assert.equal(settled,false);
    assert(!events.includes('createServ'));
    let laterGetter = 'pending';
    void pgl.getSchemaResult().then(() => {laterGetter='resolved';},error => {laterGetter=error.message;});
    await turn();
    if (scenario === 'watch-gather-failure') {
      assert.equal(laterGetter,'PostGraphile instance has been released');
      await assert.rejects(pgl.release(),/has been released/);
      assert.equal(watcherStopped,false);
    } else {
      assert.equal(laterGetter,'pending');
      await pgl.release();
      assert.equal(watcherStopped,true);
    }
    console.log(JSON.stringify({scenario,pending:true,laterGetter,watcherStopped,events}));
    return;
  }
  if (scenario === 'schema-failure') {
    schema.reject(schemaError);
    assert.equal((await result).error,schemaError);
    assert(!events.includes('createServ'));
    assert(!events.includes('ready:start'));
  } else {
    if (scenario === 'watch-retry-success') {
      schema.reject(schemaError);
      await retried.promise;
    } else schema.resolve();
    await turn();
    if (scenario === 'watch-schema-recovery') {
      assert.equal(settled,false);
      assert(!events.includes('createServ'));
      triggerWatch();
      await turn();
      assert.equal(schemaBuilds,2);
    }
    assert(events.indexOf('schema:done') < events.indexOf('createServ'));
    assert(events.includes('config:start'));
    assert(!events.includes('ready:start'));
    assert.equal(settled,false);
    if (scenario === 'attachment-failure') {
      config.resolve();
      attachment.reject(attachmentError);
      assert.equal((await result).error,attachmentError);
      assert(!events.includes('ready:start'));
    } else {
      attachment.resolve();
      await turn();
      assert(events.includes('ready:start'));
      assert.equal(settled,false);
      config.resolve();
      assert.deepEqual(await result,{success:true});
      assert(!events.includes('release'));
      await pgl.release();
      if (watch) assert.equal(watcherStopped,true);
    }
  }
  await turn();
  console.log(JSON.stringify({scenario,events}));
}
main().catch(error => {console.error(error);process.exitCode=1;});
