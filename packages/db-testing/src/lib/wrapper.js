export default function PgpWrapper(db) {
  this.db = db;
  this.client = db.client;
  this.done = db.done;
  this.ctxStmts = '';
}

PgpWrapper.prototype.setContext = function(ctx) {
  this.ctxStmts = Object.keys(ctx || {}).reduce((m,el)=>{
    m.push(`SELECT set_config('${el}', '${ctx[el]}', true);`);
    return m;
  }, []).join('\n');
};

PgpWrapper.prototype.none = function(query, values) {
  return this.db.none(this.ctxStmts + query, values);
};

PgpWrapper.prototype.one = function(query, values) {
  return this.db.one(this.ctxStmts + query, values);
};

PgpWrapper.prototype.many = function(query, values) {
  return this.db.many(this.ctxStmts + query, values);
};

PgpWrapper.prototype.oneOrNone = function(query, values) {
  return this.db.oneOrNone(this.ctxStmts + query, values);
};

PgpWrapper.prototype.manyOrNone = function(query, values) {
  return this.db.manyOrNone(this.ctxStmts + query, values);
};

PgpWrapper.prototype.any = function(query, values) {
  return this.db.any(this.ctxStmts + query, values);
};

PgpWrapper.prototype.result = function(query, values) {
  return this.db.result(this.ctxStmts + query, values);
};

PgpWrapper.prototype.func = function(query, values) {
  return this.db.func(this.ctxStmts + query, values);
};

PgpWrapper.prototype.task = function (p1, p2) {
  p1 = p1.bind({}, this);

  if (p2) {
    p2 = p2.bind({}, this);
  }

  return this.db.task(p1, p2);
};
