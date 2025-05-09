import LRU from 'lru-cache';

const ONE_HOUR_IN_MS= 1000 * 60 * 60;
const ONE_DAY = ONE_HOUR_IN_MS * 24;
const ONE_YEAR = ONE_DAY * 366;

// k8s only sends SIGTERM
const SYS_EVENTS = [
  // 'SIGUSR2',
  // 'SIGINT',
  'SIGTERM'
  // 'SIGPIPE',
  // 'SIGHUP',
  // 'SIGABRT'
];


const end = (pool) => {
  try {
    if (pool.ended || pool.ending) {
      console.error(
        'DO NOT CLOSE pool, why are you trying to call end() when already ended?'
      );
      return;
    }
    pool.end();
  } catch (e) {
    process.stderr.write(e);
  }
};

export const graphileCache = new LRU({
  max: 15,
  dispose: function (key, obj) {
    console.log(`disposing ${'PostGraphile'}[${key}]`);
  },
  updateAgeOnGet: true,
  // Maximum age in ms
  maxAge: ONE_YEAR
});

export const pgCache = new LRU({
  max: 10,
  dispose: function (key, pgPool) {
    console.log(`disposing pg ${key}`);
    graphileCache.forEach((obj, k) => {
      if (obj.pgPoolKey === key) {
        graphileCache.del(k);
      }
    });
    end(pgPool);
  },
  updateAgeOnGet: true,
  // Maximum age in ms
  maxAge: ONE_YEAR
});

export const svcCache = new LRU({
  max: 25,
  dispose: function (key, svc) {
    console.log(`disposing ${'service'}[${key}]`);
  },
  updateAgeOnGet: true,
  // Maximum age in ms
  maxAge: ONE_YEAR
});

function once(fn, context) {
    let result;
    return function () {
      if (fn) {
        result = fn.apply(context || this, arguments);
        fn = null;
      }
      return result;
    };
  }
  
const close = once(() => {
  console.log('closing server utils...');
  graphileCache.reset();
  pgCache.reset();
  svcCache.reset();
});
SYS_EVENTS.forEach((event) => {
  process.on(event, close);
});
