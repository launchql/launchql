import { Timestamp } from "./_common";
export interface pg_aggregate {
  aggfnoid: any;
  aggkind: any;
  aggnumdirectargs: number;
  aggtransfn: any;
  aggfinalfn: any;
  aggcombinefn: any;
  aggserialfn: any;
  aggdeserialfn: any;
  aggmtransfn: any;
  aggminvtransfn: any;
  aggmfinalfn: any;
  aggfinalextra: boolean;
  aggmfinalextra: boolean;
  aggfinalmodify: any;
  aggmfinalmodify: any;
  aggsortop: any;
  aggtranstype: any;
  aggtransspace: number;
  aggmtranstype: any;
  aggmtransspace: number;
  agginitval: string | null;
  aggminitval: string | null;
}
export interface pg_am {
  oid: any;
  amname: any;
  amhandler: any;
  amtype: any;
}
export interface pg_amop {
  oid: any;
  amopfamily: any;
  amoplefttype: any;
  amoprighttype: any;
  amopstrategy: number;
  amoppurpose: any;
  amopopr: any;
  amopmethod: any;
  amopsortfamily: any;
}
export interface pg_amproc {
  oid: any;
  amprocfamily: any;
  amproclefttype: any;
  amprocrighttype: any;
  amprocnum: number;
  amproc: any;
}
export interface pg_attrdef {
  oid: any;
  adrelid: any;
  adnum: number;
  adbin: any;
}
export interface pg_attribute {
  attrelid: any;
  attname: any;
  atttypid: any;
  attstattarget: number;
  attlen: number;
  attnum: number;
  attndims: number;
  attcacheoff: number;
  atttypmod: number;
  attbyval: boolean;
  attstorage: any;
  attalign: any;
  attnotnull: boolean;
  atthasdef: boolean;
  atthasmissing: boolean;
  attidentity: any;
  attgenerated: any;
  attisdropped: boolean;
  attislocal: boolean;
  attinhcount: number;
  attcollation: any;
  attacl: any | null;
  attoptions: any | null;
  attfdwoptions: any | null;
  attmissingval: any | null;
}
export interface pg_auth_members {
  roleid: any;
  member: any;
  grantor: any;
  admin_option: boolean;
}
export interface pg_authid {
  oid: any;
  rolname: any;
  rolsuper: boolean;
  rolinherit: boolean;
  rolcreaterole: boolean;
  rolcreatedb: boolean;
  rolcanlogin: boolean;
  rolreplication: boolean;
  rolbypassrls: boolean;
  rolconnlimit: number;
  rolpassword: string | null;
  rolvaliduntil: Timestamp | null;
}
export interface pg_cast {
  oid: any;
  castsource: any;
  casttarget: any;
  castfunc: any;
  castcontext: any;
  castmethod: any;
}
export interface pg_class {
  oid: any;
  relname: any;
  relnamespace: any;
  reltype: any;
  reloftype: any;
  relowner: any;
  relam: any;
  relfilenode: any;
  reltablespace: any;
  relpages: number;
  reltuples: any;
  relallvisible: number;
  reltoastrelid: any;
  relhasindex: boolean;
  relisshared: boolean;
  relpersistence: any;
  relkind: any;
  relnatts: number;
  relchecks: number;
  relhasrules: boolean;
  relhastriggers: boolean;
  relhassubclass: boolean;
  relrowsecurity: boolean;
  relforcerowsecurity: boolean;
  relispopulated: boolean;
  relreplident: any;
  relispartition: boolean;
  relrewrite: any;
  relfrozenxid: any;
  relminmxid: any;
  relacl: any | null;
  reloptions: any | null;
  relpartbound: any | null;
}
export interface pg_collation {
  oid: any;
  collname: any;
  collnamespace: any;
  collowner: any;
  collprovider: any;
  collisdeterministic: boolean;
  collencoding: number;
  collcollate: any;
  collctype: any;
  collversion: string | null;
}
export interface pg_constraint {
  oid: any;
  conname: any;
  connamespace: any;
  contype: any;
  condeferrable: boolean;
  condeferred: boolean;
  convalidated: boolean;
  conrelid: any;
  contypid: any;
  conindid: any;
  conparentid: any;
  confrelid: any;
  confupdtype: any;
  confdeltype: any;
  confmatchtype: any;
  conislocal: boolean;
  coninhcount: number;
  connoinherit: boolean;
  conkey: any | null;
  confkey: any | null;
  conpfeqop: any | null;
  conppeqop: any | null;
  conffeqop: any | null;
  conexclop: any | null;
  conbin: any | null;
}
export interface pg_conversion {
  oid: any;
  conname: any;
  connamespace: any;
  conowner: any;
  conforencoding: number;
  contoencoding: number;
  conproc: any;
  condefault: boolean;
}
export interface pg_database {
  oid: any;
  datname: any;
  datdba: any;
  encoding: number;
  datcollate: any;
  datctype: any;
  datistemplate: boolean;
  datallowconn: boolean;
  datconnlimit: number;
  datlastsysoid: any;
  datfrozenxid: any;
  datminmxid: any;
  dattablespace: any;
  datacl: any | null;
}
export interface pg_db_role_setting {
  setdatabase: any;
  setrole: any;
  setconfig: any | null;
}
export interface pg_default_acl {
  oid: any;
  defaclrole: any;
  defaclnamespace: any;
  defaclobjtype: any;
  defaclacl: any;
}
export interface pg_depend {
  classid: any;
  objid: any;
  objsubid: number;
  refclassid: any;
  refobjid: any;
  refobjsubid: number;
  deptype: any;
}
export interface pg_description {
  objoid: any;
  classoid: any;
  objsubid: number;
  description: string;
}
export interface pg_enum {
  oid: any;
  enumtypid: any;
  enumsortorder: any;
  enumlabel: any;
}
export interface pg_event_trigger {
  oid: any;
  evtname: any;
  evtevent: any;
  evtowner: any;
  evtfoid: any;
  evtenabled: any;
  evttags: any | null;
}
export interface pg_extension {
  oid: any;
  extname: any;
  extowner: any;
  extnamespace: any;
  extrelocatable: boolean;
  extversion: string;
  extconfig: any | null;
  extcondition: any | null;
}
export interface pg_foreign_data_wrapper {
  oid: any;
  fdwname: any;
  fdwowner: any;
  fdwhandler: any;
  fdwvalidator: any;
  fdwacl: any | null;
  fdwoptions: any | null;
}
export interface pg_foreign_server {
  oid: any;
  srvname: any;
  srvowner: any;
  srvfdw: any;
  srvtype: string | null;
  srvversion: string | null;
  srvacl: any | null;
  srvoptions: any | null;
}
export interface pg_foreign_table {
  ftrelid: any;
  ftserver: any;
  ftoptions: any | null;
}
export interface pg_index {
  indexrelid: any;
  indrelid: any;
  indnatts: number;
  indnkeyatts: number;
  indisunique: boolean;
  indisprimary: boolean;
  indisexclusion: boolean;
  indimmediate: boolean;
  indisclustered: boolean;
  indisvalid: boolean;
  indcheckxmin: boolean;
  indisready: boolean;
  indislive: boolean;
  indisreplident: boolean;
  indkey: any;
  indcollation: any;
  indclass: any;
  indoption: any;
  indexprs: any | null;
  indpred: any | null;
}
export interface pg_inherits {
  inhrelid: any;
  inhparent: any;
  inhseqno: number;
}
export interface pg_init_privs {
  objoid: any;
  classoid: any;
  objsubid: number;
  privtype: any;
  initprivs: any;
}
export interface pg_language {
  oid: any;
  lanname: any;
  lanowner: any;
  lanispl: boolean;
  lanpltrusted: boolean;
  lanplcallfoid: any;
  laninline: any;
  lanvalidator: any;
  lanacl: any | null;
}
export interface pg_largeobject {
  loid: any;
  pageno: number;
  data: any;
}
export interface pg_largeobject_metadata {
  oid: any;
  lomowner: any;
  lomacl: any | null;
}
export interface pg_namespace {
  oid: any;
  nspname: any;
  nspowner: any;
  nspacl: any | null;
}
export interface pg_opclass {
  oid: any;
  opcmethod: any;
  opcname: any;
  opcnamespace: any;
  opcowner: any;
  opcfamily: any;
  opcintype: any;
  opcdefault: boolean;
  opckeytype: any;
}
export interface pg_operator {
  oid: any;
  oprname: any;
  oprnamespace: any;
  oprowner: any;
  oprkind: any;
  oprcanmerge: boolean;
  oprcanhash: boolean;
  oprleft: any;
  oprright: any;
  oprresult: any;
  oprcom: any;
  oprnegate: any;
  oprcode: any;
  oprrest: any;
  oprjoin: any;
}
export interface pg_opfamily {
  oid: any;
  opfmethod: any;
  opfname: any;
  opfnamespace: any;
  opfowner: any;
}
export interface pg_partitioned_table {
  partrelid: any;
  partstrat: any;
  partnatts: number;
  partdefid: any;
  partattrs: any;
  partclass: any;
  partcollation: any;
  partexprs: any | null;
}
export interface pg_pltemplate {
  tmplname: any;
  tmpltrusted: boolean;
  tmpldbacreate: boolean;
  tmplhandler: string;
  tmplinline: string | null;
  tmplvalidator: string | null;
  tmpllibrary: string;
  tmplacl: any | null;
}
export interface pg_policy {
  oid: any;
  polname: any;
  polrelid: any;
  polcmd: any;
  polpermissive: boolean;
  polroles: any;
  polqual: any | null;
  polwithcheck: any | null;
}
export interface pg_proc {
  oid: any;
  proname: any;
  pronamespace: any;
  proowner: any;
  prolang: any;
  procost: any;
  prorows: any;
  provariadic: any;
  prosupport: any;
  prokind: any;
  prosecdef: boolean;
  proleakproof: boolean;
  proisstrict: boolean;
  proretset: boolean;
  provolatile: any;
  proparallel: any;
  pronargs: number;
  pronargdefaults: number;
  prorettype: any;
  proargtypes: any;
  proallargtypes: any | null;
  proargmodes: any | null;
  proargnames: any | null;
  proargdefaults: any | null;
  protrftypes: any | null;
  prosrc: string;
  probin: string | null;
  proconfig: any | null;
  proacl: any | null;
}
export interface pg_publication {
  oid: any;
  pubname: any;
  pubowner: any;
  puballtables: boolean;
  pubinsert: boolean;
  pubupdate: boolean;
  pubdelete: boolean;
  pubtruncate: boolean;
}
export interface pg_publication_rel {
  oid: any;
  prpubid: any;
  prrelid: any;
}
export interface pg_range {
  rngtypid: any;
  rngsubtype: any;
  rngcollation: any;
  rngsubopc: any;
  rngcanonical: any;
  rngsubdiff: any;
}
export interface pg_replication_origin {
  roident: any;
  roname: string;
}
export interface pg_rewrite {
  oid: any;
  rulename: any;
  ev_class: any;
  ev_type: any;
  ev_enabled: any;
  is_instead: boolean;
  ev_qual: any;
  ev_action: any;
}
export interface pg_seclabel {
  objoid: any;
  classoid: any;
  objsubid: number;
  provider: string;
  label: string;
}
export interface pg_sequence {
  seqrelid: any;
  seqtypid: any;
  seqstart: number;
  seqincrement: number;
  seqmax: number;
  seqmin: number;
  seqcache: number;
  seqcycle: boolean;
}
export interface pg_shdepend {
  dbid: any;
  classid: any;
  objid: any;
  objsubid: number;
  refclassid: any;
  refobjid: any;
  deptype: any;
}
export interface pg_shdescription {
  objoid: any;
  classoid: any;
  description: string;
}
export interface pg_shseclabel {
  objoid: any;
  classoid: any;
  provider: string;
  label: string;
}
export interface pg_statistic {
  starelid: any;
  staattnum: number;
  stainherit: boolean;
  stanullfrac: any;
  stawidth: number;
  stadistinct: any;
  stakind1: number;
  stakind2: number;
  stakind3: number;
  stakind4: number;
  stakind5: number;
  staop1: any;
  staop2: any;
  staop3: any;
  staop4: any;
  staop5: any;
  stacoll1: any;
  stacoll2: any;
  stacoll3: any;
  stacoll4: any;
  stacoll5: any;
  stanumbers1: any | null;
  stanumbers2: any | null;
  stanumbers3: any | null;
  stanumbers4: any | null;
  stanumbers5: any | null;
  stavalues1: any | null;
  stavalues2: any | null;
  stavalues3: any | null;
  stavalues4: any | null;
  stavalues5: any | null;
}
export interface pg_statistic_ext {
  oid: any;
  stxrelid: any;
  stxname: any;
  stxnamespace: any;
  stxowner: any;
  stxkeys: any;
  stxkind: any;
}
export interface pg_statistic_ext_data {
  stxoid: any;
  stxdndistinct: any | null;
  stxddependencies: any | null;
  stxdmcv: any | null;
}
export interface pg_subscription {
  oid: any;
  subdbid: any;
  subname: any;
  subowner: any;
  subenabled: boolean;
  subconninfo: string;
  subslotname: any;
  subsynccommit: string;
  subpublications: any;
}
export interface pg_subscription_rel {
  srsubid: any;
  srrelid: any;
  srsubstate: any;
  srsublsn: any;
}
export interface pg_tablespace {
  oid: any;
  spcname: any;
  spcowner: any;
  spcacl: any | null;
  spcoptions: any | null;
}
export interface pg_transform {
  oid: any;
  trftype: any;
  trflang: any;
  trffromsql: any;
  trftosql: any;
}
export interface pg_trigger {
  oid: any;
  tgrelid: any;
  tgname: any;
  tgfoid: any;
  tgtype: number;
  tgenabled: any;
  tgisinternal: boolean;
  tgconstrrelid: any;
  tgconstrindid: any;
  tgconstraint: any;
  tgdeferrable: boolean;
  tginitdeferred: boolean;
  tgnargs: number;
  tgattr: any;
  tgargs: any;
  tgqual: any | null;
  tgoldtable: any | null;
  tgnewtable: any | null;
}
export interface pg_ts_config {
  oid: any;
  cfgname: any;
  cfgnamespace: any;
  cfgowner: any;
  cfgparser: any;
}
export interface pg_ts_config_map {
  mapcfg: any;
  maptokentype: number;
  mapseqno: number;
  mapdict: any;
}
export interface pg_ts_dict {
  oid: any;
  dictname: any;
  dictnamespace: any;
  dictowner: any;
  dicttemplate: any;
  dictinitoption: string | null;
}
export interface pg_ts_parser {
  oid: any;
  prsname: any;
  prsnamespace: any;
  prsstart: any;
  prstoken: any;
  prsend: any;
  prsheadline: any;
  prslextype: any;
}
export interface pg_ts_template {
  oid: any;
  tmplname: any;
  tmplnamespace: any;
  tmplinit: any;
  tmpllexize: any;
}
export interface pg_type {
  oid: any;
  typname: any;
  typnamespace: any;
  typowner: any;
  typlen: number;
  typbyval: boolean;
  typtype: any;
  typcategory: any;
  typispreferred: boolean;
  typisdefined: boolean;
  typdelim: any;
  typrelid: any;
  typelem: any;
  typarray: any;
  typinput: any;
  typoutput: any;
  typreceive: any;
  typsend: any;
  typmodin: any;
  typmodout: any;
  typanalyze: any;
  typalign: any;
  typstorage: any;
  typnotnull: boolean;
  typbasetype: any;
  typtypmod: number;
  typndims: number;
  typcollation: any;
  typdefaultbin: any | null;
  typdefault: string | null;
  typacl: any | null;
}
export interface pg_user_mapping {
  oid: any;
  umuser: any;
  umserver: any;
  umoptions: any | null;
}