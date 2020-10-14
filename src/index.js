export const jsonSet = (vresult, prop, value) => {
  if (typeof value !== 'undefined') vresult[prop] = value;
  return vresult;
};
export const RawStmt = ({ stmt }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'stmt', stmt);
  return {
    RawStmt: vresult
  };
};
export const CreateSchemaStmt = ({
  schemaname,
  if_not_exists,
  schemaElts,
  authrole
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'schemaname', schemaname);
  vresult = jsonSet(vresult, 'if_not_exists', if_not_exists);
  vresult = jsonSet(vresult, 'schemaElts', schemaElts);
  vresult = jsonSet(vresult, 'authrole', authrole);
  return {
    CreateSchemaStmt: vresult
  };
};
export const CreateStmt = ({
  relation,
  tableElts,
  oncommit,
  inhRelations,
  options,
  ofTypename,
  if_not_exists
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'tableElts', tableElts);
  vresult = jsonSet(vresult, 'oncommit', oncommit);
  vresult = jsonSet(vresult, 'inhRelations', inhRelations);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'ofTypename', ofTypename);
  vresult = jsonSet(vresult, 'if_not_exists', if_not_exists);
  return {
    CreateStmt: vresult
  };
};
export const RangeVar = ({
  schemaname,
  relname,
  inh,
  relpersistence,
  alias
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'schemaname', schemaname);
  vresult = jsonSet(vresult, 'relname', relname);
  vresult = jsonSet(vresult, 'inh', inh);
  vresult = jsonSet(vresult, 'relpersistence', relpersistence);
  vresult = jsonSet(vresult, 'alias', alias);
  return {
    RangeVar: vresult
  };
};
export const ColumnDef = ({
  colname,
  typeName,
  is_local,
  constraints,
  raw_default,
  collClause,
  fdwoptions
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'colname', colname);
  vresult = jsonSet(vresult, 'typeName', typeName);
  vresult = jsonSet(vresult, 'is_local', is_local);
  vresult = jsonSet(vresult, 'constraints', constraints);
  vresult = jsonSet(vresult, 'raw_default', raw_default);
  vresult = jsonSet(vresult, 'collClause', collClause);
  vresult = jsonSet(vresult, 'fdwoptions', fdwoptions);
  return {
    ColumnDef: vresult
  };
};
export const TypeName = ({ names, typemod, typmods, setof, arrayBounds }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'names', names);
  vresult = jsonSet(vresult, 'typemod', typemod);
  vresult = jsonSet(vresult, 'typmods', typmods);
  vresult = jsonSet(vresult, 'setof', setof);
  vresult = jsonSet(vresult, 'arrayBounds', arrayBounds);
  return {
    TypeName: vresult
  };
};
export const String = ({ str }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'str', str);
  return {
    String: vresult
  };
};
export const Constraint = ({
  contype,
  raw_expr,
  conname,
  pktable,
  fk_attrs,
  pk_attrs,
  fk_matchtype,
  fk_upd_action,
  fk_del_action,
  initially_valid,
  keys,
  is_no_inherit,
  skip_validation,
  exclusions,
  access_method,
  deferrable,
  indexname
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'contype', contype);
  vresult = jsonSet(vresult, 'raw_expr', raw_expr);
  vresult = jsonSet(vresult, 'conname', conname);
  vresult = jsonSet(vresult, 'pktable', pktable);
  vresult = jsonSet(vresult, 'fk_attrs', fk_attrs);
  vresult = jsonSet(vresult, 'pk_attrs', pk_attrs);
  vresult = jsonSet(vresult, 'fk_matchtype', fk_matchtype);
  vresult = jsonSet(vresult, 'fk_upd_action', fk_upd_action);
  vresult = jsonSet(vresult, 'fk_del_action', fk_del_action);
  vresult = jsonSet(vresult, 'initially_valid', initially_valid);
  vresult = jsonSet(vresult, 'keys', keys);
  vresult = jsonSet(vresult, 'is_no_inherit', is_no_inherit);
  vresult = jsonSet(vresult, 'skip_validation', skip_validation);
  vresult = jsonSet(vresult, 'exclusions', exclusions);
  vresult = jsonSet(vresult, 'access_method', access_method);
  vresult = jsonSet(vresult, 'deferrable', deferrable);
  vresult = jsonSet(vresult, 'indexname', indexname);
  return {
    Constraint: vresult
  };
};
export const A_Const = ({ val }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'val', val);
  return {
    A_Const: vresult
  };
};
export const Integer = ({ ival }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'ival', ival);
  return {
    Integer: vresult
  };
};
export const AlterTableStmt = ({ relation, cmds, relkind, missing_ok }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'cmds', cmds);
  vresult = jsonSet(vresult, 'relkind', relkind);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  return {
    AlterTableStmt: vresult
  };
};
export const AlterTableCmd = ({
  subtype,
  behavior,
  name,
  def,
  missing_ok,
  newowner
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'subtype', subtype);
  vresult = jsonSet(vresult, 'behavior', behavior);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'def', def);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  vresult = jsonSet(vresult, 'newowner', newowner);
  return {
    AlterTableCmd: vresult
  };
};
export const SQLValueFunction = ({ op, typmod }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'op', op);
  vresult = jsonSet(vresult, 'typmod', typmod);
  return {
    SQLValueFunction: vresult
  };
};
export const RenameStmt = ({
  renameType,
  relationType,
  relation,
  subname,
  newname,
  behavior,
  object,
  missing_ok
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'renameType', renameType);
  vresult = jsonSet(vresult, 'relationType', relationType);
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'subname', subname);
  vresult = jsonSet(vresult, 'newname', newname);
  vresult = jsonSet(vresult, 'behavior', behavior);
  vresult = jsonSet(vresult, 'object', object);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  return {
    RenameStmt: vresult
  };
};
export const A_Expr = ({ kind, name, lexpr, rexpr }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'kind', kind);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'lexpr', lexpr);
  vresult = jsonSet(vresult, 'rexpr', rexpr);
  return {
    A_Expr: vresult
  };
};
export const TypeCast = ({ arg, typeName }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'arg', arg);
  vresult = jsonSet(vresult, 'typeName', typeName);
  return {
    TypeCast: vresult
  };
};
export const ColumnRef = ({ fields }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'fields', fields);
  return {
    ColumnRef: vresult
  };
};
export const FuncCall = ({
  funcname,
  args,
  agg_star,
  func_variadic,
  agg_order,
  agg_distinct,
  agg_filter,
  agg_within_group,
  over
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'funcname', funcname);
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'agg_star', agg_star);
  vresult = jsonSet(vresult, 'func_variadic', func_variadic);
  vresult = jsonSet(vresult, 'agg_order', agg_order);
  vresult = jsonSet(vresult, 'agg_distinct', agg_distinct);
  vresult = jsonSet(vresult, 'agg_filter', agg_filter);
  vresult = jsonSet(vresult, 'agg_within_group', agg_within_group);
  vresult = jsonSet(vresult, 'over', over);
  return {
    FuncCall: vresult
  };
};
export const AlterDefaultPrivilegesStmt = ({ options, action }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'action', action);
  return {
    AlterDefaultPrivilegesStmt: vresult
  };
};
export const DefElem = ({ defname, arg, defaction, defnamespace }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'defname', defname);
  vresult = jsonSet(vresult, 'arg', arg);
  vresult = jsonSet(vresult, 'defaction', defaction);
  vresult = jsonSet(vresult, 'defnamespace', defnamespace);
  return {
    DefElem: vresult
  };
};
export const GrantStmt = ({
  is_grant,
  targtype,
  objtype,
  privileges,
  grantees,
  behavior,
  objects,
  grant_option
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'is_grant', is_grant);
  vresult = jsonSet(vresult, 'targtype', targtype);
  vresult = jsonSet(vresult, 'objtype', objtype);
  vresult = jsonSet(vresult, 'privileges', privileges);
  vresult = jsonSet(vresult, 'grantees', grantees);
  vresult = jsonSet(vresult, 'behavior', behavior);
  vresult = jsonSet(vresult, 'objects', objects);
  vresult = jsonSet(vresult, 'grant_option', grant_option);
  return {
    GrantStmt: vresult
  };
};
export const AccessPriv = ({ priv_name, cols }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'priv_name', priv_name);
  vresult = jsonSet(vresult, 'cols', cols);
  return {
    AccessPriv: vresult
  };
};
export const RoleSpec = ({ roletype, rolename }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'roletype', roletype);
  vresult = jsonSet(vresult, 'rolename', rolename);
  return {
    RoleSpec: vresult
  };
};
export const CommentStmt = ({ objtype, object, comment }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'objtype', objtype);
  vresult = jsonSet(vresult, 'object', object);
  vresult = jsonSet(vresult, 'comment', comment);
  return {
    CommentStmt: vresult
  };
};
export const ObjectWithArgs = ({ objname, objargs, args_unspecified }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'objname', objname);
  vresult = jsonSet(vresult, 'objargs', objargs);
  vresult = jsonSet(vresult, 'args_unspecified', args_unspecified);
  return {
    ObjectWithArgs: vresult
  };
};
export const SelectStmt = ({
  targetList,
  fromClause,
  groupClause,
  havingClause,
  op,
  sortClause,
  whereClause,
  distinctClause,
  limitCount,
  valuesLists,
  intoClause,
  all,
  larg,
  rarg,
  limitOffset,
  withClause,
  lockingClause,
  windowClause
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'targetList', targetList);
  vresult = jsonSet(vresult, 'fromClause', fromClause);
  vresult = jsonSet(vresult, 'groupClause', groupClause);
  vresult = jsonSet(vresult, 'havingClause', havingClause);
  vresult = jsonSet(vresult, 'op', op);
  vresult = jsonSet(vresult, 'sortClause', sortClause);
  vresult = jsonSet(vresult, 'whereClause', whereClause);
  vresult = jsonSet(vresult, 'distinctClause', distinctClause);
  vresult = jsonSet(vresult, 'limitCount', limitCount);
  vresult = jsonSet(vresult, 'valuesLists', valuesLists);
  vresult = jsonSet(vresult, 'intoClause', intoClause);
  vresult = jsonSet(vresult, 'all', all);
  vresult = jsonSet(vresult, 'larg', larg);
  vresult = jsonSet(vresult, 'rarg', rarg);
  vresult = jsonSet(vresult, 'limitOffset', limitOffset);
  vresult = jsonSet(vresult, 'withClause', withClause);
  vresult = jsonSet(vresult, 'lockingClause', lockingClause);
  vresult = jsonSet(vresult, 'windowClause', windowClause);
  return {
    SelectStmt: vresult
  };
};
export const ResTarget = ({ val, name, indirection }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'val', val);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'indirection', indirection);
  return {
    ResTarget: vresult
  };
};
export const Alias = ({ aliasname, colnames }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'aliasname', aliasname);
  vresult = jsonSet(vresult, 'colnames', colnames);
  return {
    Alias: vresult
  };
};
export const JoinExpr = ({
  jointype,
  larg,
  rarg,
  quals,
  usingClause,
  isNatural,
  alias
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'jointype', jointype);
  vresult = jsonSet(vresult, 'larg', larg);
  vresult = jsonSet(vresult, 'rarg', rarg);
  vresult = jsonSet(vresult, 'quals', quals);
  vresult = jsonSet(vresult, 'usingClause', usingClause);
  vresult = jsonSet(vresult, 'isNatural', isNatural);
  vresult = jsonSet(vresult, 'alias', alias);
  return {
    JoinExpr: vresult
  };
};
export const BoolExpr = ({ boolop, args }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'boolop', boolop);
  vresult = jsonSet(vresult, 'args', args);
  return {
    BoolExpr: vresult
  };
};
export const A_Star = ({}) => {
  const vresult = {};
  return {
    A_Star: vresult
  };
};
export const SortBy = ({ node, sortby_dir, sortby_nulls, useOp }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'node', node);
  vresult = jsonSet(vresult, 'sortby_dir', sortby_dir);
  vresult = jsonSet(vresult, 'sortby_nulls', sortby_nulls);
  vresult = jsonSet(vresult, 'useOp', useOp);
  return {
    SortBy: vresult
  };
};
export const NamedArgExpr = ({ arg, name, argnumber }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'arg', arg);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'argnumber', argnumber);
  return {
    NamedArgExpr: vresult
  };
};
export const A_ArrayExpr = ({ elements }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'elements', elements);
  return {
    A_ArrayExpr: vresult
  };
};
export const Float = ({ str }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'str', str);
  return {
    Float: vresult
  };
};
export const RangeFunction = ({
  is_rowsfrom,
  functions,
  coldeflist,
  alias,
  lateral,
  ordinality
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'is_rowsfrom', is_rowsfrom);
  vresult = jsonSet(vresult, 'functions', functions);
  vresult = jsonSet(vresult, 'coldeflist', coldeflist);
  vresult = jsonSet(vresult, 'alias', alias);
  vresult = jsonSet(vresult, 'lateral', lateral);
  vresult = jsonSet(vresult, 'ordinality', ordinality);
  return {
    RangeFunction: vresult
  };
};
export const SubLink = ({ subLinkType, subselect, testexpr, operName }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'subLinkType', subLinkType);
  vresult = jsonSet(vresult, 'subselect', subselect);
  vresult = jsonSet(vresult, 'testexpr', testexpr);
  vresult = jsonSet(vresult, 'operName', operName);
  return {
    SubLink: vresult
  };
};
export const Null = ({}) => {
  const vresult = {};
  return {
    Null: vresult
  };
};
export const VariableSetStmt = ({ kind, name, args, is_local }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'kind', kind);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'is_local', is_local);
  return {
    VariableSetStmt: vresult
  };
};
export const VariableShowStmt = ({ name }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'name', name);
  return {
    VariableShowStmt: vresult
  };
};
export const DoStmt = ({ args }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'args', args);
  return {
    DoStmt: vresult
  };
};
export const CreateDomainStmt = ({
  domainname,
  typeName,
  constraints,
  collClause
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'domainname', domainname);
  vresult = jsonSet(vresult, 'typeName', typeName);
  vresult = jsonSet(vresult, 'constraints', constraints);
  vresult = jsonSet(vresult, 'collClause', collClause);
  return {
    CreateDomainStmt: vresult
  };
};
export const CreateEnumStmt = ({ typeName, vals }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'typeName', typeName);
  vresult = jsonSet(vresult, 'vals', vals);
  return {
    CreateEnumStmt: vresult
  };
};
export const CreateExtensionStmt = ({ extname, options, if_not_exists }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'extname', extname);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'if_not_exists', if_not_exists);
  return {
    CreateExtensionStmt: vresult
  };
};
export const CreateFunctionStmt = ({
  replace,
  funcname,
  parameters,
  returnType,
  options
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'replace', replace);
  vresult = jsonSet(vresult, 'funcname', funcname);
  vresult = jsonSet(vresult, 'parameters', parameters);
  vresult = jsonSet(vresult, 'returnType', returnType);
  vresult = jsonSet(vresult, 'options', options);
  return {
    CreateFunctionStmt: vresult
  };
};
export const FunctionParameter = ({ name, argType, mode, defexpr }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'argType', argType);
  vresult = jsonSet(vresult, 'mode', mode);
  vresult = jsonSet(vresult, 'defexpr', defexpr);
  return {
    FunctionParameter: vresult
  };
};
export const TransactionStmt = ({ kind, options, gid }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'kind', kind);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'gid', gid);
  return {
    TransactionStmt: vresult
  };
};
export const IndexStmt = ({
  idxname,
  relation,
  accessMethod,
  indexParams,
  concurrent,
  unique,
  whereClause,
  options,
  if_not_exists
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'idxname', idxname);
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'accessMethod', accessMethod);
  vresult = jsonSet(vresult, 'indexParams', indexParams);
  vresult = jsonSet(vresult, 'concurrent', concurrent);
  vresult = jsonSet(vresult, 'unique', unique);
  vresult = jsonSet(vresult, 'whereClause', whereClause);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'if_not_exists', if_not_exists);
  return {
    IndexStmt: vresult
  };
};
export const IndexElem = ({
  name,
  ordering,
  nulls_ordering,
  expr,
  opclass,
  collation
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'ordering', ordering);
  vresult = jsonSet(vresult, 'nulls_ordering', nulls_ordering);
  vresult = jsonSet(vresult, 'expr', expr);
  vresult = jsonSet(vresult, 'opclass', opclass);
  vresult = jsonSet(vresult, 'collation', collation);
  return {
    IndexElem: vresult
  };
};
export const NullTest = ({ arg, nulltesttype }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'arg', arg);
  vresult = jsonSet(vresult, 'nulltesttype', nulltesttype);
  return {
    NullTest: vresult
  };
};
export const ParamRef = ({ number }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'number', number);
  return {
    ParamRef: vresult
  };
};
export const CreatePolicyStmt = ({
  policy_name,
  table,
  cmd_name,
  permissive,
  roles,
  qual,
  with_check
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'policy_name', policy_name);
  vresult = jsonSet(vresult, 'table', table);
  vresult = jsonSet(vresult, 'cmd_name', cmd_name);
  vresult = jsonSet(vresult, 'permissive', permissive);
  vresult = jsonSet(vresult, 'roles', roles);
  vresult = jsonSet(vresult, 'qual', qual);
  vresult = jsonSet(vresult, 'with_check', with_check);
  return {
    CreatePolicyStmt: vresult
  };
};
export const RangeSubselect = ({ subquery, alias, lateral }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'subquery', subquery);
  vresult = jsonSet(vresult, 'alias', alias);
  vresult = jsonSet(vresult, 'lateral', lateral);
  return {
    RangeSubselect: vresult
  };
};
export const A_Indirection = ({ arg, indirection }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'arg', arg);
  vresult = jsonSet(vresult, 'indirection', indirection);
  return {
    A_Indirection: vresult
  };
};
export const RowExpr = ({ args, row_format }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'row_format', row_format);
  return {
    RowExpr: vresult
  };
};
export const CreateRoleStmt = ({ stmt_type, role, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'stmt_type', stmt_type);
  vresult = jsonSet(vresult, 'role', role);
  vresult = jsonSet(vresult, 'options', options);
  return {
    CreateRoleStmt: vresult
  };
};
export const GrantRoleStmt = ({
  granted_roles,
  grantee_roles,
  is_grant,
  behavior,
  admin_opt
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'granted_roles', granted_roles);
  vresult = jsonSet(vresult, 'grantee_roles', grantee_roles);
  vresult = jsonSet(vresult, 'is_grant', is_grant);
  vresult = jsonSet(vresult, 'behavior', behavior);
  vresult = jsonSet(vresult, 'admin_opt', admin_opt);
  return {
    GrantRoleStmt: vresult
  };
};
export const RuleStmt = ({
  relation,
  rulename,
  event,
  instead,
  actions,
  whereClause,
  replace
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'rulename', rulename);
  vresult = jsonSet(vresult, 'event', event);
  vresult = jsonSet(vresult, 'instead', instead);
  vresult = jsonSet(vresult, 'actions', actions);
  vresult = jsonSet(vresult, 'whereClause', whereClause);
  vresult = jsonSet(vresult, 'replace', replace);
  return {
    RuleStmt: vresult
  };
};
export const UpdateStmt = ({
  relation,
  targetList,
  whereClause,
  returningList,
  fromClause,
  withClause
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'targetList', targetList);
  vresult = jsonSet(vresult, 'whereClause', whereClause);
  vresult = jsonSet(vresult, 'returningList', returningList);
  vresult = jsonSet(vresult, 'fromClause', fromClause);
  vresult = jsonSet(vresult, 'withClause', withClause);
  return {
    UpdateStmt: vresult
  };
};
export const DeleteStmt = ({
  relation,
  whereClause,
  usingClause,
  returningList,
  withClause
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'whereClause', whereClause);
  vresult = jsonSet(vresult, 'usingClause', usingClause);
  vresult = jsonSet(vresult, 'returningList', returningList);
  vresult = jsonSet(vresult, 'withClause', withClause);
  return {
    DeleteStmt: vresult
  };
};
export const InsertStmt = ({
  relation,
  selectStmt,
  override,
  cols,
  onConflictClause,
  returningList,
  withClause
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'selectStmt', selectStmt);
  vresult = jsonSet(vresult, 'override', override);
  vresult = jsonSet(vresult, 'cols', cols);
  vresult = jsonSet(vresult, 'onConflictClause', onConflictClause);
  vresult = jsonSet(vresult, 'returningList', returningList);
  vresult = jsonSet(vresult, 'withClause', withClause);
  return {
    InsertStmt: vresult
  };
};
export const CreateSeqStmt = ({ sequence, options, if_not_exists }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'sequence', sequence);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'if_not_exists', if_not_exists);
  return {
    CreateSeqStmt: vresult
  };
};
export const OnConflictClause = ({
  action,
  infer,
  targetList,
  whereClause
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'action', action);
  vresult = jsonSet(vresult, 'infer', infer);
  vresult = jsonSet(vresult, 'targetList', targetList);
  vresult = jsonSet(vresult, 'whereClause', whereClause);
  return {
    OnConflictClause: vresult
  };
};
export const InferClause = ({ indexElems, conname, whereClause }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'indexElems', indexElems);
  vresult = jsonSet(vresult, 'conname', conname);
  vresult = jsonSet(vresult, 'whereClause', whereClause);
  return {
    InferClause: vresult
  };
};
export const MultiAssignRef = ({ source, colno, ncolumns }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'source', source);
  vresult = jsonSet(vresult, 'colno', colno);
  vresult = jsonSet(vresult, 'ncolumns', ncolumns);
  return {
    MultiAssignRef: vresult
  };
};
export const SetToDefault = ({}) => {
  const vresult = {};
  return {
    SetToDefault: vresult
  };
};
export const MinMaxExpr = ({ op, args }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'op', op);
  vresult = jsonSet(vresult, 'args', args);
  return {
    MinMaxExpr: vresult
  };
};
export const DropStmt = ({
  objects,
  removeType,
  behavior,
  missing_ok,
  concurrent
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'objects', objects);
  vresult = jsonSet(vresult, 'removeType', removeType);
  vresult = jsonSet(vresult, 'behavior', behavior);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  vresult = jsonSet(vresult, 'concurrent', concurrent);
  return {
    DropStmt: vresult
  };
};
export const CreateTrigStmt = ({
  trigname,
  relation,
  funcname,
  row,
  timing,
  events,
  args,
  columns,
  whenClause,
  transitionRels,
  isconstraint,
  deferrable,
  initdeferred
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'trigname', trigname);
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'funcname', funcname);
  vresult = jsonSet(vresult, 'row', row);
  vresult = jsonSet(vresult, 'timing', timing);
  vresult = jsonSet(vresult, 'events', events);
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'columns', columns);
  vresult = jsonSet(vresult, 'whenClause', whenClause);
  vresult = jsonSet(vresult, 'transitionRels', transitionRels);
  vresult = jsonSet(vresult, 'isconstraint', isconstraint);
  vresult = jsonSet(vresult, 'deferrable', deferrable);
  vresult = jsonSet(vresult, 'initdeferred', initdeferred);
  return {
    CreateTrigStmt: vresult
  };
};
export const TriggerTransition = ({ name, isNew, isTable }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'isNew', isNew);
  vresult = jsonSet(vresult, 'isTable', isTable);
  return {
    TriggerTransition: vresult
  };
};
export const CompositeTypeStmt = ({ typevar, coldeflist }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'typevar', typevar);
  vresult = jsonSet(vresult, 'coldeflist', coldeflist);
  return {
    CompositeTypeStmt: vresult
  };
};
export const ExplainStmt = ({ query, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'query', query);
  vresult = jsonSet(vresult, 'options', options);
  return {
    ExplainStmt: vresult
  };
};
export const ViewStmt = ({
  view,
  query,
  withCheckOption,
  replace,
  aliases,
  options
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'view', view);
  vresult = jsonSet(vresult, 'query', query);
  vresult = jsonSet(vresult, 'withCheckOption', withCheckOption);
  vresult = jsonSet(vresult, 'replace', replace);
  vresult = jsonSet(vresult, 'aliases', aliases);
  vresult = jsonSet(vresult, 'options', options);
  return {
    ViewStmt: vresult
  };
};
export const CollateClause = ({ arg, collname }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'arg', arg);
  vresult = jsonSet(vresult, 'collname', collname);
  return {
    CollateClause: vresult
  };
};
export const DefineStmt = ({ kind, defnames, args, definition, oldstyle }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'kind', kind);
  vresult = jsonSet(vresult, 'defnames', defnames);
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'definition', definition);
  vresult = jsonSet(vresult, 'oldstyle', oldstyle);
  return {
    DefineStmt: vresult
  };
};
export const DropRoleStmt = ({ roles, missing_ok }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'roles', roles);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  return {
    DropRoleStmt: vresult
  };
};
export const AlterOwnerStmt = ({ objectType, object, newowner }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'objectType', objectType);
  vresult = jsonSet(vresult, 'object', object);
  vresult = jsonSet(vresult, 'newowner', newowner);
  return {
    AlterOwnerStmt: vresult
  };
};
export const AlterObjectSchemaStmt = ({
  objectType,
  object,
  newschema,
  relation,
  missing_ok
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'objectType', objectType);
  vresult = jsonSet(vresult, 'object', object);
  vresult = jsonSet(vresult, 'newschema', newschema);
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  return {
    AlterObjectSchemaStmt: vresult
  };
};
export const CreateConversionStmt = ({
  conversion_name,
  for_encoding_name,
  to_encoding_name,
  func_name,
  def
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'conversion_name', conversion_name);
  vresult = jsonSet(vresult, 'for_encoding_name', for_encoding_name);
  vresult = jsonSet(vresult, 'to_encoding_name', to_encoding_name);
  vresult = jsonSet(vresult, 'func_name', func_name);
  vresult = jsonSet(vresult, 'def', def);
  return {
    CreateConversionStmt: vresult
  };
};
export const CreateFdwStmt = ({ fdwname, func_options, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'fdwname', fdwname);
  vresult = jsonSet(vresult, 'func_options', func_options);
  vresult = jsonSet(vresult, 'options', options);
  return {
    CreateFdwStmt: vresult
  };
};
export const CreateForeignServerStmt = ({
  servername,
  fdwname,
  options,
  servertype,
  version
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'servername', servername);
  vresult = jsonSet(vresult, 'fdwname', fdwname);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'servertype', servertype);
  vresult = jsonSet(vresult, 'version', version);
  return {
    CreateForeignServerStmt: vresult
  };
};
export const CreatePLangStmt = ({ plname, plhandler }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'plname', plname);
  vresult = jsonSet(vresult, 'plhandler', plhandler);
  return {
    CreatePLangStmt: vresult
  };
};
export const CreateOpFamilyStmt = ({ opfamilyname, amname }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'opfamilyname', opfamilyname);
  vresult = jsonSet(vresult, 'amname', amname);
  return {
    CreateOpFamilyStmt: vresult
  };
};
export const CreateOpClassStmt = ({
  opclassname,
  amname,
  datatype,
  items,
  isDefault
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'opclassname', opclassname);
  vresult = jsonSet(vresult, 'amname', amname);
  vresult = jsonSet(vresult, 'datatype', datatype);
  vresult = jsonSet(vresult, 'items', items);
  vresult = jsonSet(vresult, 'isDefault', isDefault);
  return {
    CreateOpClassStmt: vresult
  };
};
export const CreateOpClassItem = ({
  itemtype,
  storedtype,
  name,
  number,
  class_args,
  order_family
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'itemtype', itemtype);
  vresult = jsonSet(vresult, 'storedtype', storedtype);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'number', number);
  vresult = jsonSet(vresult, 'class_args', class_args);
  vresult = jsonSet(vresult, 'order_family', order_family);
  return {
    CreateOpClassItem: vresult
  };
};
export const AlterOpFamilyStmt = ({ opfamilyname, amname, items, isDrop }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'opfamilyname', opfamilyname);
  vresult = jsonSet(vresult, 'amname', amname);
  vresult = jsonSet(vresult, 'items', items);
  vresult = jsonSet(vresult, 'isDrop', isDrop);
  return {
    AlterOpFamilyStmt: vresult
  };
};
export const AlterOperatorStmt = ({ opername, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'opername', opername);
  vresult = jsonSet(vresult, 'options', options);
  return {
    AlterOperatorStmt: vresult
  };
};
export const VacuumStmt = ({ options, relation, va_cols }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'va_cols', va_cols);
  return {
    VacuumStmt: vresult
  };
};
export const CreateTableAsStmt = ({ query, into, relkind, if_not_exists }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'query', query);
  vresult = jsonSet(vresult, 'into', into);
  vresult = jsonSet(vresult, 'relkind', relkind);
  vresult = jsonSet(vresult, 'if_not_exists', if_not_exists);
  return {
    CreateTableAsStmt: vresult
  };
};
export const IntoClause = ({ rel, onCommit, colNames, skipData, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'rel', rel);
  vresult = jsonSet(vresult, 'onCommit', onCommit);
  vresult = jsonSet(vresult, 'colNames', colNames);
  vresult = jsonSet(vresult, 'skipData', skipData);
  vresult = jsonSet(vresult, 'options', options);
  return {
    IntoClause: vresult
  };
};
export const CaseExpr = ({ args, defresult, arg }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'defresult', defresult);
  vresult = jsonSet(vresult, 'arg', arg);
  return {
    CaseExpr: vresult
  };
};
export const CaseWhen = ({ expr, result }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'expr', expr);
  vresult = jsonSet(vresult, 'result', result);
  return {
    CaseWhen: vresult
  };
};
export const BooleanTest = ({ arg, booltesttype }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'arg', arg);
  vresult = jsonSet(vresult, 'booltesttype', booltesttype);
  return {
    BooleanTest: vresult
  };
};
export const AlterFunctionStmt = ({ func, actions }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'func', func);
  vresult = jsonSet(vresult, 'actions', actions);
  return {
    AlterFunctionStmt: vresult
  };
};
export const TruncateStmt = ({ relations, behavior, restart_seqs }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relations', relations);
  vresult = jsonSet(vresult, 'behavior', behavior);
  vresult = jsonSet(vresult, 'restart_seqs', restart_seqs);
  return {
    TruncateStmt: vresult
  };
};
export const A_Indices = ({ is_slice, lidx, uidx }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'is_slice', is_slice);
  vresult = jsonSet(vresult, 'lidx', lidx);
  vresult = jsonSet(vresult, 'uidx', uidx);
  return {
    A_Indices: vresult
  };
};
export const NotifyStmt = ({ conditionname }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'conditionname', conditionname);
  return {
    NotifyStmt: vresult
  };
};
export const ListenStmt = ({ conditionname }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'conditionname', conditionname);
  return {
    ListenStmt: vresult
  };
};
export const UnlistenStmt = ({ conditionname }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'conditionname', conditionname);
  return {
    UnlistenStmt: vresult
  };
};
export const BitString = ({ str }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'str', str);
  return {
    BitString: vresult
  };
};
export const CoalesceExpr = ({ args }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'args', args);
  return {
    CoalesceExpr: vresult
  };
};
export const ClusterStmt = ({ relation, indexname }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'indexname', indexname);
  return {
    ClusterStmt: vresult
  };
};
export const TableLikeClause = ({ relation, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'options', options);
  return {
    TableLikeClause: vresult
  };
};
export const WithClause = ({ ctes, recursive }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'ctes', ctes);
  vresult = jsonSet(vresult, 'recursive', recursive);
  return {
    WithClause: vresult
  };
};
export const CommonTableExpr = ({ ctename, aliascolnames, ctequery }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'ctename', ctename);
  vresult = jsonSet(vresult, 'aliascolnames', aliascolnames);
  vresult = jsonSet(vresult, 'ctequery', ctequery);
  return {
    CommonTableExpr: vresult
  };
};
export const CreateRangeStmt = ({ typeName, params }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'typeName', typeName);
  vresult = jsonSet(vresult, 'params', params);
  return {
    CreateRangeStmt: vresult
  };
};
export const DeclareCursorStmt = ({ portalname, options, query }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'portalname', portalname);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'query', query);
  return {
    DeclareCursorStmt: vresult
  };
};
export const FetchStmt = ({ direction, howMany, portalname, ismove }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'direction', direction);
  vresult = jsonSet(vresult, 'howMany', howMany);
  vresult = jsonSet(vresult, 'portalname', portalname);
  vresult = jsonSet(vresult, 'ismove', ismove);
  return {
    FetchStmt: vresult
  };
};
export const LockingClause = ({ strength, waitPolicy, lockedRels }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'strength', strength);
  vresult = jsonSet(vresult, 'waitPolicy', waitPolicy);
  vresult = jsonSet(vresult, 'lockedRels', lockedRels);
  return {
    LockingClause: vresult
  };
};
export const CreateAmStmt = ({ amname, handler_name, amtype }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'amname', amname);
  vresult = jsonSet(vresult, 'handler_name', handler_name);
  vresult = jsonSet(vresult, 'amtype', amtype);
  return {
    CreateAmStmt: vresult
  };
};
export const CreateCastStmt = ({
  sourcetype,
  targettype,
  context,
  inout,
  func
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'sourcetype', sourcetype);
  vresult = jsonSet(vresult, 'targettype', targettype);
  vresult = jsonSet(vresult, 'context', context);
  vresult = jsonSet(vresult, 'inout', inout);
  vresult = jsonSet(vresult, 'func', func);
  return {
    CreateCastStmt: vresult
  };
};
export const ReindexStmt = ({ kind, relation, options, name }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'kind', kind);
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'name', name);
  return {
    ReindexStmt: vresult
  };
};
export const DropOwnedStmt = ({ roles, behavior }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'roles', roles);
  vresult = jsonSet(vresult, 'behavior', behavior);
  return {
    DropOwnedStmt: vresult
  };
};
export const ReassignOwnedStmt = ({ roles, newrole }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'roles', roles);
  vresult = jsonSet(vresult, 'newrole', newrole);
  return {
    ReassignOwnedStmt: vresult
  };
};
export const AlterSeqStmt = ({ sequence, options, missing_ok }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'sequence', sequence);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  return {
    AlterSeqStmt: vresult
  };
};
export const AlterDomainStmt = ({
  subtype,
  typeName,
  behavior,
  def,
  name,
  missing_ok
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'subtype', subtype);
  vresult = jsonSet(vresult, 'typeName', typeName);
  vresult = jsonSet(vresult, 'behavior', behavior);
  vresult = jsonSet(vresult, 'def', def);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  return {
    AlterDomainStmt: vresult
  };
};
export const PrepareStmt = ({ name, query, argtypes }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'query', query);
  vresult = jsonSet(vresult, 'argtypes', argtypes);
  return {
    PrepareStmt: vresult
  };
};
export const ExecuteStmt = ({ name, params }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'params', params);
  return {
    ExecuteStmt: vresult
  };
};
export const AlterEnumStmt = ({
  typeName,
  newVal,
  newValIsAfter,
  newValNeighbor,
  skipIfNewValExists
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'typeName', typeName);
  vresult = jsonSet(vresult, 'newVal', newVal);
  vresult = jsonSet(vresult, 'newValIsAfter', newValIsAfter);
  vresult = jsonSet(vresult, 'newValNeighbor', newValNeighbor);
  vresult = jsonSet(vresult, 'skipIfNewValExists', skipIfNewValExists);
  return {
    AlterEnumStmt: vresult
  };
};
export const CreateEventTrigStmt = ({
  trigname,
  eventname,
  funcname,
  whenclause
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'trigname', trigname);
  vresult = jsonSet(vresult, 'eventname', eventname);
  vresult = jsonSet(vresult, 'funcname', funcname);
  vresult = jsonSet(vresult, 'whenclause', whenclause);
  return {
    CreateEventTrigStmt: vresult
  };
};
export const AlterEventTrigStmt = ({ trigname, tgenabled }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'trigname', trigname);
  vresult = jsonSet(vresult, 'tgenabled', tgenabled);
  return {
    AlterEventTrigStmt: vresult
  };
};
export const CreateUserMappingStmt = ({ user, servername, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'user', user);
  vresult = jsonSet(vresult, 'servername', servername);
  vresult = jsonSet(vresult, 'options', options);
  return {
    CreateUserMappingStmt: vresult
  };
};
export const AlterRoleStmt = ({ role, options, action }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'role', role);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'action', action);
  return {
    AlterRoleStmt: vresult
  };
};
export const AlterPolicyStmt = ({ policy_name, table, qual }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'policy_name', policy_name);
  vresult = jsonSet(vresult, 'table', table);
  vresult = jsonSet(vresult, 'qual', qual);
  return {
    AlterPolicyStmt: vresult
  };
};
export const AlterFdwStmt = ({ fdwname, func_options, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'fdwname', fdwname);
  vresult = jsonSet(vresult, 'func_options', func_options);
  vresult = jsonSet(vresult, 'options', options);
  return {
    AlterFdwStmt: vresult
  };
};
export const AlterForeignServerStmt = ({
  servername,
  version,
  options,
  has_version
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'servername', servername);
  vresult = jsonSet(vresult, 'version', version);
  vresult = jsonSet(vresult, 'options', options);
  vresult = jsonSet(vresult, 'has_version', has_version);
  return {
    AlterForeignServerStmt: vresult
  };
};
export const AlterUserMappingStmt = ({ user, servername, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'user', user);
  vresult = jsonSet(vresult, 'servername', servername);
  vresult = jsonSet(vresult, 'options', options);
  return {
    AlterUserMappingStmt: vresult
  };
};
export const DropUserMappingStmt = ({ user, servername, missing_ok }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'user', user);
  vresult = jsonSet(vresult, 'servername', servername);
  vresult = jsonSet(vresult, 'missing_ok', missing_ok);
  return {
    DropUserMappingStmt: vresult
  };
};
export const CreateForeignTableStmt = ({ base, servername, options }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'base', base);
  vresult = jsonSet(vresult, 'servername', servername);
  vresult = jsonSet(vresult, 'options', options);
  return {
    CreateForeignTableStmt: vresult
  };
};
export const ImportForeignSchemaStmt = ({
  server_name,
  remote_schema,
  local_schema,
  list_type,
  table_list,
  options
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'server_name', server_name);
  vresult = jsonSet(vresult, 'remote_schema', remote_schema);
  vresult = jsonSet(vresult, 'local_schema', local_schema);
  vresult = jsonSet(vresult, 'list_type', list_type);
  vresult = jsonSet(vresult, 'table_list', table_list);
  vresult = jsonSet(vresult, 'options', options);
  return {
    ImportForeignSchemaStmt: vresult
  };
};
export const ConstraintsSetStmt = ({ deferred }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'deferred', deferred);
  return {
    ConstraintsSetStmt: vresult
  };
};
export const GroupingFunc = ({ args }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'args', args);
  return {
    GroupingFunc: vresult
  };
};
export const GroupingSet = ({ kind, content }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'kind', kind);
  vresult = jsonSet(vresult, 'content', content);
  return {
    GroupingSet: vresult
  };
};
export const WindowDef = ({
  orderClause,
  frameOptions,
  partitionClause,
  name,
  startOffset,
  endOffset
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'orderClause', orderClause);
  vresult = jsonSet(vresult, 'frameOptions', frameOptions);
  vresult = jsonSet(vresult, 'partitionClause', partitionClause);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'startOffset', startOffset);
  vresult = jsonSet(vresult, 'endOffset', endOffset);
  return {
    WindowDef: vresult
  };
};
export const DiscardStmt = ({ target }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'target', target);
  return {
    DiscardStmt: vresult
  };
};
export const LockStmt = ({ relations, mode, nowait }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relations', relations);
  vresult = jsonSet(vresult, 'mode', mode);
  vresult = jsonSet(vresult, 'nowait', nowait);
  return {
    LockStmt: vresult
  };
};
export const AlterRoleSetStmt = ({ role, setstmt }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'role', role);
  vresult = jsonSet(vresult, 'setstmt', setstmt);
  return {
    AlterRoleSetStmt: vresult
  };
};
export const RefreshMatViewStmt = ({ relation, concurrent, skipData }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'concurrent', concurrent);
  vresult = jsonSet(vresult, 'skipData', skipData);
  return {
    RefreshMatViewStmt: vresult
  };
};
export const CreateTransformStmt = ({ type_name, lang, fromsql, tosql }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'type_name', type_name);
  vresult = jsonSet(vresult, 'lang', lang);
  vresult = jsonSet(vresult, 'fromsql', fromsql);
  vresult = jsonSet(vresult, 'tosql', tosql);
  return {
    CreateTransformStmt: vresult
  };
};
export const ClosePortalStmt = ({ portalname }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'portalname', portalname);
  return {
    ClosePortalStmt: vresult
  };
};
export const CurrentOfExpr = ({ cursor_name }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'cursor_name', cursor_name);
  return {
    CurrentOfExpr: vresult
  };
};
export const DeallocateStmt = ({ name }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'name', name);
  return {
    DeallocateStmt: vresult
  };
};
export const ReplicaIdentityStmt = ({ identity_type, name }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'identity_type', identity_type);
  vresult = jsonSet(vresult, 'name', name);
  return {
    ReplicaIdentityStmt: vresult
  };
};
export const RangeTableSample = ({ relation, method, args, repeatable }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'relation', relation);
  vresult = jsonSet(vresult, 'method', method);
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'repeatable', repeatable);
  return {
    RangeTableSample: vresult
  };
};
export const SecLabelStmt = ({ objtype, object, label, provider }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'objtype', objtype);
  vresult = jsonSet(vresult, 'object', object);
  vresult = jsonSet(vresult, 'label', label);
  vresult = jsonSet(vresult, 'provider', provider);
  return {
    SecLabelStmt: vresult
  };
};
export const CopyStmt = ({ query, filename }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'query', query);
  vresult = jsonSet(vresult, 'filename', filename);
  return {
    CopyStmt: vresult
  };
};
export const AlterTSConfigurationStmt = ({
  kind,
  cfgname,
  tokentype,
  dicts,
  override,
  replace
}) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'kind', kind);
  vresult = jsonSet(vresult, 'cfgname', cfgname);
  vresult = jsonSet(vresult, 'tokentype', tokentype);
  vresult = jsonSet(vresult, 'dicts', dicts);
  vresult = jsonSet(vresult, 'override', override);
  vresult = jsonSet(vresult, 'replace', replace);
  return {
    AlterTSConfigurationStmt: vresult
  };
};
export const XmlExpr = ({ op, args, name, xmloption, named_args }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'op', op);
  vresult = jsonSet(vresult, 'args', args);
  vresult = jsonSet(vresult, 'name', name);
  vresult = jsonSet(vresult, 'xmloption', xmloption);
  vresult = jsonSet(vresult, 'named_args', named_args);
  return {
    XmlExpr: vresult
  };
};
export const XmlSerialize = ({ xmloption, expr, typeName }) => {
  let vresult = {};
  vresult = jsonSet(vresult, 'xmloption', xmloption);
  vresult = jsonSet(vresult, 'expr', expr);
  vresult = jsonSet(vresult, 'typeName', typeName);
  return {
    XmlSerialize: vresult
  };
};
