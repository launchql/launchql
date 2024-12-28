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
export class pg_aggregate implements pg_aggregate {
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
  constructor(data: pg_aggregate) {
    this.aggfnoid = data.aggfnoid;
    this.aggkind = data.aggkind;
    this.aggnumdirectargs = data.aggnumdirectargs;
    this.aggtransfn = data.aggtransfn;
    this.aggfinalfn = data.aggfinalfn;
    this.aggcombinefn = data.aggcombinefn;
    this.aggserialfn = data.aggserialfn;
    this.aggdeserialfn = data.aggdeserialfn;
    this.aggmtransfn = data.aggmtransfn;
    this.aggminvtransfn = data.aggminvtransfn;
    this.aggmfinalfn = data.aggmfinalfn;
    this.aggfinalextra = data.aggfinalextra;
    this.aggmfinalextra = data.aggmfinalextra;
    this.aggfinalmodify = data.aggfinalmodify;
    this.aggmfinalmodify = data.aggmfinalmodify;
    this.aggsortop = data.aggsortop;
    this.aggtranstype = data.aggtranstype;
    this.aggtransspace = data.aggtransspace;
    this.aggmtranstype = data.aggmtranstype;
    this.aggmtransspace = data.aggmtransspace;
    this.agginitval = data.agginitval;
    this.aggminitval = data.aggminitval;
  }
}
export interface pg_am {
  oid: any;
  amname: any;
  amhandler: any;
  amtype: any;
}
export class pg_am implements pg_am {
  oid: any;
  amname: any;
  amhandler: any;
  amtype: any;
  constructor(data: pg_am) {
    this.oid = data.oid;
    this.amname = data.amname;
    this.amhandler = data.amhandler;
    this.amtype = data.amtype;
  }
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
export class pg_amop implements pg_amop {
  oid: any;
  amopfamily: any;
  amoplefttype: any;
  amoprighttype: any;
  amopstrategy: number;
  amoppurpose: any;
  amopopr: any;
  amopmethod: any;
  amopsortfamily: any;
  constructor(data: pg_amop) {
    this.oid = data.oid;
    this.amopfamily = data.amopfamily;
    this.amoplefttype = data.amoplefttype;
    this.amoprighttype = data.amoprighttype;
    this.amopstrategy = data.amopstrategy;
    this.amoppurpose = data.amoppurpose;
    this.amopopr = data.amopopr;
    this.amopmethod = data.amopmethod;
    this.amopsortfamily = data.amopsortfamily;
  }
}
export interface pg_amproc {
  oid: any;
  amprocfamily: any;
  amproclefttype: any;
  amprocrighttype: any;
  amprocnum: number;
  amproc: any;
}
export class pg_amproc implements pg_amproc {
  oid: any;
  amprocfamily: any;
  amproclefttype: any;
  amprocrighttype: any;
  amprocnum: number;
  amproc: any;
  constructor(data: pg_amproc) {
    this.oid = data.oid;
    this.amprocfamily = data.amprocfamily;
    this.amproclefttype = data.amproclefttype;
    this.amprocrighttype = data.amprocrighttype;
    this.amprocnum = data.amprocnum;
    this.amproc = data.amproc;
  }
}
export interface pg_attrdef {
  oid: any;
  adrelid: any;
  adnum: number;
  adbin: any;
}
export class pg_attrdef implements pg_attrdef {
  oid: any;
  adrelid: any;
  adnum: number;
  adbin: any;
  constructor(data: pg_attrdef) {
    this.oid = data.oid;
    this.adrelid = data.adrelid;
    this.adnum = data.adnum;
    this.adbin = data.adbin;
  }
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
export class pg_attribute implements pg_attribute {
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
  constructor(data: pg_attribute) {
    this.attrelid = data.attrelid;
    this.attname = data.attname;
    this.atttypid = data.atttypid;
    this.attstattarget = data.attstattarget;
    this.attlen = data.attlen;
    this.attnum = data.attnum;
    this.attndims = data.attndims;
    this.attcacheoff = data.attcacheoff;
    this.atttypmod = data.atttypmod;
    this.attbyval = data.attbyval;
    this.attstorage = data.attstorage;
    this.attalign = data.attalign;
    this.attnotnull = data.attnotnull;
    this.atthasdef = data.atthasdef;
    this.atthasmissing = data.atthasmissing;
    this.attidentity = data.attidentity;
    this.attgenerated = data.attgenerated;
    this.attisdropped = data.attisdropped;
    this.attislocal = data.attislocal;
    this.attinhcount = data.attinhcount;
    this.attcollation = data.attcollation;
    this.attacl = data.attacl;
    this.attoptions = data.attoptions;
    this.attfdwoptions = data.attfdwoptions;
    this.attmissingval = data.attmissingval;
  }
}
export interface pg_auth_members {
  roleid: any;
  member: any;
  grantor: any;
  admin_option: boolean;
}
export class pg_auth_members implements pg_auth_members {
  roleid: any;
  member: any;
  grantor: any;
  admin_option: boolean;
  constructor(data: pg_auth_members) {
    this.roleid = data.roleid;
    this.member = data.member;
    this.grantor = data.grantor;
    this.admin_option = data.admin_option;
  }
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
export class pg_authid implements pg_authid {
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
  constructor(data: pg_authid) {
    this.oid = data.oid;
    this.rolname = data.rolname;
    this.rolsuper = data.rolsuper;
    this.rolinherit = data.rolinherit;
    this.rolcreaterole = data.rolcreaterole;
    this.rolcreatedb = data.rolcreatedb;
    this.rolcanlogin = data.rolcanlogin;
    this.rolreplication = data.rolreplication;
    this.rolbypassrls = data.rolbypassrls;
    this.rolconnlimit = data.rolconnlimit;
    this.rolpassword = data.rolpassword;
    this.rolvaliduntil = data.rolvaliduntil;
  }
}
export interface pg_cast {
  oid: any;
  castsource: any;
  casttarget: any;
  castfunc: any;
  castcontext: any;
  castmethod: any;
}
export class pg_cast implements pg_cast {
  oid: any;
  castsource: any;
  casttarget: any;
  castfunc: any;
  castcontext: any;
  castmethod: any;
  constructor(data: pg_cast) {
    this.oid = data.oid;
    this.castsource = data.castsource;
    this.casttarget = data.casttarget;
    this.castfunc = data.castfunc;
    this.castcontext = data.castcontext;
    this.castmethod = data.castmethod;
  }
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
export class pg_class implements pg_class {
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
  constructor(data: pg_class) {
    this.oid = data.oid;
    this.relname = data.relname;
    this.relnamespace = data.relnamespace;
    this.reltype = data.reltype;
    this.reloftype = data.reloftype;
    this.relowner = data.relowner;
    this.relam = data.relam;
    this.relfilenode = data.relfilenode;
    this.reltablespace = data.reltablespace;
    this.relpages = data.relpages;
    this.reltuples = data.reltuples;
    this.relallvisible = data.relallvisible;
    this.reltoastrelid = data.reltoastrelid;
    this.relhasindex = data.relhasindex;
    this.relisshared = data.relisshared;
    this.relpersistence = data.relpersistence;
    this.relkind = data.relkind;
    this.relnatts = data.relnatts;
    this.relchecks = data.relchecks;
    this.relhasrules = data.relhasrules;
    this.relhastriggers = data.relhastriggers;
    this.relhassubclass = data.relhassubclass;
    this.relrowsecurity = data.relrowsecurity;
    this.relforcerowsecurity = data.relforcerowsecurity;
    this.relispopulated = data.relispopulated;
    this.relreplident = data.relreplident;
    this.relispartition = data.relispartition;
    this.relrewrite = data.relrewrite;
    this.relfrozenxid = data.relfrozenxid;
    this.relminmxid = data.relminmxid;
    this.relacl = data.relacl;
    this.reloptions = data.reloptions;
    this.relpartbound = data.relpartbound;
  }
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
export class pg_collation implements pg_collation {
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
  constructor(data: pg_collation) {
    this.oid = data.oid;
    this.collname = data.collname;
    this.collnamespace = data.collnamespace;
    this.collowner = data.collowner;
    this.collprovider = data.collprovider;
    this.collisdeterministic = data.collisdeterministic;
    this.collencoding = data.collencoding;
    this.collcollate = data.collcollate;
    this.collctype = data.collctype;
    this.collversion = data.collversion;
  }
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
export class pg_constraint implements pg_constraint {
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
  constructor(data: pg_constraint) {
    this.oid = data.oid;
    this.conname = data.conname;
    this.connamespace = data.connamespace;
    this.contype = data.contype;
    this.condeferrable = data.condeferrable;
    this.condeferred = data.condeferred;
    this.convalidated = data.convalidated;
    this.conrelid = data.conrelid;
    this.contypid = data.contypid;
    this.conindid = data.conindid;
    this.conparentid = data.conparentid;
    this.confrelid = data.confrelid;
    this.confupdtype = data.confupdtype;
    this.confdeltype = data.confdeltype;
    this.confmatchtype = data.confmatchtype;
    this.conislocal = data.conislocal;
    this.coninhcount = data.coninhcount;
    this.connoinherit = data.connoinherit;
    this.conkey = data.conkey;
    this.confkey = data.confkey;
    this.conpfeqop = data.conpfeqop;
    this.conppeqop = data.conppeqop;
    this.conffeqop = data.conffeqop;
    this.conexclop = data.conexclop;
    this.conbin = data.conbin;
  }
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
export class pg_conversion implements pg_conversion {
  oid: any;
  conname: any;
  connamespace: any;
  conowner: any;
  conforencoding: number;
  contoencoding: number;
  conproc: any;
  condefault: boolean;
  constructor(data: pg_conversion) {
    this.oid = data.oid;
    this.conname = data.conname;
    this.connamespace = data.connamespace;
    this.conowner = data.conowner;
    this.conforencoding = data.conforencoding;
    this.contoencoding = data.contoencoding;
    this.conproc = data.conproc;
    this.condefault = data.condefault;
  }
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
export class pg_database implements pg_database {
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
  constructor(data: pg_database) {
    this.oid = data.oid;
    this.datname = data.datname;
    this.datdba = data.datdba;
    this.encoding = data.encoding;
    this.datcollate = data.datcollate;
    this.datctype = data.datctype;
    this.datistemplate = data.datistemplate;
    this.datallowconn = data.datallowconn;
    this.datconnlimit = data.datconnlimit;
    this.datlastsysoid = data.datlastsysoid;
    this.datfrozenxid = data.datfrozenxid;
    this.datminmxid = data.datminmxid;
    this.dattablespace = data.dattablespace;
    this.datacl = data.datacl;
  }
}
export interface pg_db_role_setting {
  setdatabase: any;
  setrole: any;
  setconfig: any | null;
}
export class pg_db_role_setting implements pg_db_role_setting {
  setdatabase: any;
  setrole: any;
  setconfig: any | null;
  constructor(data: pg_db_role_setting) {
    this.setdatabase = data.setdatabase;
    this.setrole = data.setrole;
    this.setconfig = data.setconfig;
  }
}
export interface pg_default_acl {
  oid: any;
  defaclrole: any;
  defaclnamespace: any;
  defaclobjtype: any;
  defaclacl: any;
}
export class pg_default_acl implements pg_default_acl {
  oid: any;
  defaclrole: any;
  defaclnamespace: any;
  defaclobjtype: any;
  defaclacl: any;
  constructor(data: pg_default_acl) {
    this.oid = data.oid;
    this.defaclrole = data.defaclrole;
    this.defaclnamespace = data.defaclnamespace;
    this.defaclobjtype = data.defaclobjtype;
    this.defaclacl = data.defaclacl;
  }
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
export class pg_depend implements pg_depend {
  classid: any;
  objid: any;
  objsubid: number;
  refclassid: any;
  refobjid: any;
  refobjsubid: number;
  deptype: any;
  constructor(data: pg_depend) {
    this.classid = data.classid;
    this.objid = data.objid;
    this.objsubid = data.objsubid;
    this.refclassid = data.refclassid;
    this.refobjid = data.refobjid;
    this.refobjsubid = data.refobjsubid;
    this.deptype = data.deptype;
  }
}
export interface pg_description {
  objoid: any;
  classoid: any;
  objsubid: number;
  description: string;
}
export class pg_description implements pg_description {
  objoid: any;
  classoid: any;
  objsubid: number;
  description: string;
  constructor(data: pg_description) {
    this.objoid = data.objoid;
    this.classoid = data.classoid;
    this.objsubid = data.objsubid;
    this.description = data.description;
  }
}
export interface pg_enum {
  oid: any;
  enumtypid: any;
  enumsortorder: any;
  enumlabel: any;
}
export class pg_enum implements pg_enum {
  oid: any;
  enumtypid: any;
  enumsortorder: any;
  enumlabel: any;
  constructor(data: pg_enum) {
    this.oid = data.oid;
    this.enumtypid = data.enumtypid;
    this.enumsortorder = data.enumsortorder;
    this.enumlabel = data.enumlabel;
  }
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
export class pg_event_trigger implements pg_event_trigger {
  oid: any;
  evtname: any;
  evtevent: any;
  evtowner: any;
  evtfoid: any;
  evtenabled: any;
  evttags: any | null;
  constructor(data: pg_event_trigger) {
    this.oid = data.oid;
    this.evtname = data.evtname;
    this.evtevent = data.evtevent;
    this.evtowner = data.evtowner;
    this.evtfoid = data.evtfoid;
    this.evtenabled = data.evtenabled;
    this.evttags = data.evttags;
  }
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
export class pg_extension implements pg_extension {
  oid: any;
  extname: any;
  extowner: any;
  extnamespace: any;
  extrelocatable: boolean;
  extversion: string;
  extconfig: any | null;
  extcondition: any | null;
  constructor(data: pg_extension) {
    this.oid = data.oid;
    this.extname = data.extname;
    this.extowner = data.extowner;
    this.extnamespace = data.extnamespace;
    this.extrelocatable = data.extrelocatable;
    this.extversion = data.extversion;
    this.extconfig = data.extconfig;
    this.extcondition = data.extcondition;
  }
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
export class pg_foreign_data_wrapper implements pg_foreign_data_wrapper {
  oid: any;
  fdwname: any;
  fdwowner: any;
  fdwhandler: any;
  fdwvalidator: any;
  fdwacl: any | null;
  fdwoptions: any | null;
  constructor(data: pg_foreign_data_wrapper) {
    this.oid = data.oid;
    this.fdwname = data.fdwname;
    this.fdwowner = data.fdwowner;
    this.fdwhandler = data.fdwhandler;
    this.fdwvalidator = data.fdwvalidator;
    this.fdwacl = data.fdwacl;
    this.fdwoptions = data.fdwoptions;
  }
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
export class pg_foreign_server implements pg_foreign_server {
  oid: any;
  srvname: any;
  srvowner: any;
  srvfdw: any;
  srvtype: string | null;
  srvversion: string | null;
  srvacl: any | null;
  srvoptions: any | null;
  constructor(data: pg_foreign_server) {
    this.oid = data.oid;
    this.srvname = data.srvname;
    this.srvowner = data.srvowner;
    this.srvfdw = data.srvfdw;
    this.srvtype = data.srvtype;
    this.srvversion = data.srvversion;
    this.srvacl = data.srvacl;
    this.srvoptions = data.srvoptions;
  }
}
export interface pg_foreign_table {
  ftrelid: any;
  ftserver: any;
  ftoptions: any | null;
}
export class pg_foreign_table implements pg_foreign_table {
  ftrelid: any;
  ftserver: any;
  ftoptions: any | null;
  constructor(data: pg_foreign_table) {
    this.ftrelid = data.ftrelid;
    this.ftserver = data.ftserver;
    this.ftoptions = data.ftoptions;
  }
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
export class pg_index implements pg_index {
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
  constructor(data: pg_index) {
    this.indexrelid = data.indexrelid;
    this.indrelid = data.indrelid;
    this.indnatts = data.indnatts;
    this.indnkeyatts = data.indnkeyatts;
    this.indisunique = data.indisunique;
    this.indisprimary = data.indisprimary;
    this.indisexclusion = data.indisexclusion;
    this.indimmediate = data.indimmediate;
    this.indisclustered = data.indisclustered;
    this.indisvalid = data.indisvalid;
    this.indcheckxmin = data.indcheckxmin;
    this.indisready = data.indisready;
    this.indislive = data.indislive;
    this.indisreplident = data.indisreplident;
    this.indkey = data.indkey;
    this.indcollation = data.indcollation;
    this.indclass = data.indclass;
    this.indoption = data.indoption;
    this.indexprs = data.indexprs;
    this.indpred = data.indpred;
  }
}
export interface pg_inherits {
  inhrelid: any;
  inhparent: any;
  inhseqno: number;
}
export class pg_inherits implements pg_inherits {
  inhrelid: any;
  inhparent: any;
  inhseqno: number;
  constructor(data: pg_inherits) {
    this.inhrelid = data.inhrelid;
    this.inhparent = data.inhparent;
    this.inhseqno = data.inhseqno;
  }
}
export interface pg_init_privs {
  objoid: any;
  classoid: any;
  objsubid: number;
  privtype: any;
  initprivs: any;
}
export class pg_init_privs implements pg_init_privs {
  objoid: any;
  classoid: any;
  objsubid: number;
  privtype: any;
  initprivs: any;
  constructor(data: pg_init_privs) {
    this.objoid = data.objoid;
    this.classoid = data.classoid;
    this.objsubid = data.objsubid;
    this.privtype = data.privtype;
    this.initprivs = data.initprivs;
  }
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
export class pg_language implements pg_language {
  oid: any;
  lanname: any;
  lanowner: any;
  lanispl: boolean;
  lanpltrusted: boolean;
  lanplcallfoid: any;
  laninline: any;
  lanvalidator: any;
  lanacl: any | null;
  constructor(data: pg_language) {
    this.oid = data.oid;
    this.lanname = data.lanname;
    this.lanowner = data.lanowner;
    this.lanispl = data.lanispl;
    this.lanpltrusted = data.lanpltrusted;
    this.lanplcallfoid = data.lanplcallfoid;
    this.laninline = data.laninline;
    this.lanvalidator = data.lanvalidator;
    this.lanacl = data.lanacl;
  }
}
export interface pg_largeobject {
  loid: any;
  pageno: number;
  data: any;
}
export class pg_largeobject implements pg_largeobject {
  loid: any;
  pageno: number;
  data: any;
  constructor(data: pg_largeobject) {
    this.loid = data.loid;
    this.pageno = data.pageno;
    this.data = data.data;
  }
}
export interface pg_largeobject_metadata {
  oid: any;
  lomowner: any;
  lomacl: any | null;
}
export class pg_largeobject_metadata implements pg_largeobject_metadata {
  oid: any;
  lomowner: any;
  lomacl: any | null;
  constructor(data: pg_largeobject_metadata) {
    this.oid = data.oid;
    this.lomowner = data.lomowner;
    this.lomacl = data.lomacl;
  }
}
export interface pg_namespace {
  oid: any;
  nspname: any;
  nspowner: any;
  nspacl: any | null;
}
export class pg_namespace implements pg_namespace {
  oid: any;
  nspname: any;
  nspowner: any;
  nspacl: any | null;
  constructor(data: pg_namespace) {
    this.oid = data.oid;
    this.nspname = data.nspname;
    this.nspowner = data.nspowner;
    this.nspacl = data.nspacl;
  }
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
export class pg_opclass implements pg_opclass {
  oid: any;
  opcmethod: any;
  opcname: any;
  opcnamespace: any;
  opcowner: any;
  opcfamily: any;
  opcintype: any;
  opcdefault: boolean;
  opckeytype: any;
  constructor(data: pg_opclass) {
    this.oid = data.oid;
    this.opcmethod = data.opcmethod;
    this.opcname = data.opcname;
    this.opcnamespace = data.opcnamespace;
    this.opcowner = data.opcowner;
    this.opcfamily = data.opcfamily;
    this.opcintype = data.opcintype;
    this.opcdefault = data.opcdefault;
    this.opckeytype = data.opckeytype;
  }
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
export class pg_operator implements pg_operator {
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
  constructor(data: pg_operator) {
    this.oid = data.oid;
    this.oprname = data.oprname;
    this.oprnamespace = data.oprnamespace;
    this.oprowner = data.oprowner;
    this.oprkind = data.oprkind;
    this.oprcanmerge = data.oprcanmerge;
    this.oprcanhash = data.oprcanhash;
    this.oprleft = data.oprleft;
    this.oprright = data.oprright;
    this.oprresult = data.oprresult;
    this.oprcom = data.oprcom;
    this.oprnegate = data.oprnegate;
    this.oprcode = data.oprcode;
    this.oprrest = data.oprrest;
    this.oprjoin = data.oprjoin;
  }
}
export interface pg_opfamily {
  oid: any;
  opfmethod: any;
  opfname: any;
  opfnamespace: any;
  opfowner: any;
}
export class pg_opfamily implements pg_opfamily {
  oid: any;
  opfmethod: any;
  opfname: any;
  opfnamespace: any;
  opfowner: any;
  constructor(data: pg_opfamily) {
    this.oid = data.oid;
    this.opfmethod = data.opfmethod;
    this.opfname = data.opfname;
    this.opfnamespace = data.opfnamespace;
    this.opfowner = data.opfowner;
  }
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
export class pg_partitioned_table implements pg_partitioned_table {
  partrelid: any;
  partstrat: any;
  partnatts: number;
  partdefid: any;
  partattrs: any;
  partclass: any;
  partcollation: any;
  partexprs: any | null;
  constructor(data: pg_partitioned_table) {
    this.partrelid = data.partrelid;
    this.partstrat = data.partstrat;
    this.partnatts = data.partnatts;
    this.partdefid = data.partdefid;
    this.partattrs = data.partattrs;
    this.partclass = data.partclass;
    this.partcollation = data.partcollation;
    this.partexprs = data.partexprs;
  }
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
export class pg_pltemplate implements pg_pltemplate {
  tmplname: any;
  tmpltrusted: boolean;
  tmpldbacreate: boolean;
  tmplhandler: string;
  tmplinline: string | null;
  tmplvalidator: string | null;
  tmpllibrary: string;
  tmplacl: any | null;
  constructor(data: pg_pltemplate) {
    this.tmplname = data.tmplname;
    this.tmpltrusted = data.tmpltrusted;
    this.tmpldbacreate = data.tmpldbacreate;
    this.tmplhandler = data.tmplhandler;
    this.tmplinline = data.tmplinline;
    this.tmplvalidator = data.tmplvalidator;
    this.tmpllibrary = data.tmpllibrary;
    this.tmplacl = data.tmplacl;
  }
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
export class pg_policy implements pg_policy {
  oid: any;
  polname: any;
  polrelid: any;
  polcmd: any;
  polpermissive: boolean;
  polroles: any;
  polqual: any | null;
  polwithcheck: any | null;
  constructor(data: pg_policy) {
    this.oid = data.oid;
    this.polname = data.polname;
    this.polrelid = data.polrelid;
    this.polcmd = data.polcmd;
    this.polpermissive = data.polpermissive;
    this.polroles = data.polroles;
    this.polqual = data.polqual;
    this.polwithcheck = data.polwithcheck;
  }
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
export class pg_proc implements pg_proc {
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
  constructor(data: pg_proc) {
    this.oid = data.oid;
    this.proname = data.proname;
    this.pronamespace = data.pronamespace;
    this.proowner = data.proowner;
    this.prolang = data.prolang;
    this.procost = data.procost;
    this.prorows = data.prorows;
    this.provariadic = data.provariadic;
    this.prosupport = data.prosupport;
    this.prokind = data.prokind;
    this.prosecdef = data.prosecdef;
    this.proleakproof = data.proleakproof;
    this.proisstrict = data.proisstrict;
    this.proretset = data.proretset;
    this.provolatile = data.provolatile;
    this.proparallel = data.proparallel;
    this.pronargs = data.pronargs;
    this.pronargdefaults = data.pronargdefaults;
    this.prorettype = data.prorettype;
    this.proargtypes = data.proargtypes;
    this.proallargtypes = data.proallargtypes;
    this.proargmodes = data.proargmodes;
    this.proargnames = data.proargnames;
    this.proargdefaults = data.proargdefaults;
    this.protrftypes = data.protrftypes;
    this.prosrc = data.prosrc;
    this.probin = data.probin;
    this.proconfig = data.proconfig;
    this.proacl = data.proacl;
  }
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
export class pg_publication implements pg_publication {
  oid: any;
  pubname: any;
  pubowner: any;
  puballtables: boolean;
  pubinsert: boolean;
  pubupdate: boolean;
  pubdelete: boolean;
  pubtruncate: boolean;
  constructor(data: pg_publication) {
    this.oid = data.oid;
    this.pubname = data.pubname;
    this.pubowner = data.pubowner;
    this.puballtables = data.puballtables;
    this.pubinsert = data.pubinsert;
    this.pubupdate = data.pubupdate;
    this.pubdelete = data.pubdelete;
    this.pubtruncate = data.pubtruncate;
  }
}
export interface pg_publication_rel {
  oid: any;
  prpubid: any;
  prrelid: any;
}
export class pg_publication_rel implements pg_publication_rel {
  oid: any;
  prpubid: any;
  prrelid: any;
  constructor(data: pg_publication_rel) {
    this.oid = data.oid;
    this.prpubid = data.prpubid;
    this.prrelid = data.prrelid;
  }
}
export interface pg_range {
  rngtypid: any;
  rngsubtype: any;
  rngcollation: any;
  rngsubopc: any;
  rngcanonical: any;
  rngsubdiff: any;
}
export class pg_range implements pg_range {
  rngtypid: any;
  rngsubtype: any;
  rngcollation: any;
  rngsubopc: any;
  rngcanonical: any;
  rngsubdiff: any;
  constructor(data: pg_range) {
    this.rngtypid = data.rngtypid;
    this.rngsubtype = data.rngsubtype;
    this.rngcollation = data.rngcollation;
    this.rngsubopc = data.rngsubopc;
    this.rngcanonical = data.rngcanonical;
    this.rngsubdiff = data.rngsubdiff;
  }
}
export interface pg_replication_origin {
  roident: any;
  roname: string;
}
export class pg_replication_origin implements pg_replication_origin {
  roident: any;
  roname: string;
  constructor(data: pg_replication_origin) {
    this.roident = data.roident;
    this.roname = data.roname;
  }
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
export class pg_rewrite implements pg_rewrite {
  oid: any;
  rulename: any;
  ev_class: any;
  ev_type: any;
  ev_enabled: any;
  is_instead: boolean;
  ev_qual: any;
  ev_action: any;
  constructor(data: pg_rewrite) {
    this.oid = data.oid;
    this.rulename = data.rulename;
    this.ev_class = data.ev_class;
    this.ev_type = data.ev_type;
    this.ev_enabled = data.ev_enabled;
    this.is_instead = data.is_instead;
    this.ev_qual = data.ev_qual;
    this.ev_action = data.ev_action;
  }
}
export interface pg_seclabel {
  objoid: any;
  classoid: any;
  objsubid: number;
  provider: string;
  label: string;
}
export class pg_seclabel implements pg_seclabel {
  objoid: any;
  classoid: any;
  objsubid: number;
  provider: string;
  label: string;
  constructor(data: pg_seclabel) {
    this.objoid = data.objoid;
    this.classoid = data.classoid;
    this.objsubid = data.objsubid;
    this.provider = data.provider;
    this.label = data.label;
  }
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
export class pg_sequence implements pg_sequence {
  seqrelid: any;
  seqtypid: any;
  seqstart: number;
  seqincrement: number;
  seqmax: number;
  seqmin: number;
  seqcache: number;
  seqcycle: boolean;
  constructor(data: pg_sequence) {
    this.seqrelid = data.seqrelid;
    this.seqtypid = data.seqtypid;
    this.seqstart = data.seqstart;
    this.seqincrement = data.seqincrement;
    this.seqmax = data.seqmax;
    this.seqmin = data.seqmin;
    this.seqcache = data.seqcache;
    this.seqcycle = data.seqcycle;
  }
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
export class pg_shdepend implements pg_shdepend {
  dbid: any;
  classid: any;
  objid: any;
  objsubid: number;
  refclassid: any;
  refobjid: any;
  deptype: any;
  constructor(data: pg_shdepend) {
    this.dbid = data.dbid;
    this.classid = data.classid;
    this.objid = data.objid;
    this.objsubid = data.objsubid;
    this.refclassid = data.refclassid;
    this.refobjid = data.refobjid;
    this.deptype = data.deptype;
  }
}
export interface pg_shdescription {
  objoid: any;
  classoid: any;
  description: string;
}
export class pg_shdescription implements pg_shdescription {
  objoid: any;
  classoid: any;
  description: string;
  constructor(data: pg_shdescription) {
    this.objoid = data.objoid;
    this.classoid = data.classoid;
    this.description = data.description;
  }
}
export interface pg_shseclabel {
  objoid: any;
  classoid: any;
  provider: string;
  label: string;
}
export class pg_shseclabel implements pg_shseclabel {
  objoid: any;
  classoid: any;
  provider: string;
  label: string;
  constructor(data: pg_shseclabel) {
    this.objoid = data.objoid;
    this.classoid = data.classoid;
    this.provider = data.provider;
    this.label = data.label;
  }
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
export class pg_statistic implements pg_statistic {
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
  constructor(data: pg_statistic) {
    this.starelid = data.starelid;
    this.staattnum = data.staattnum;
    this.stainherit = data.stainherit;
    this.stanullfrac = data.stanullfrac;
    this.stawidth = data.stawidth;
    this.stadistinct = data.stadistinct;
    this.stakind1 = data.stakind1;
    this.stakind2 = data.stakind2;
    this.stakind3 = data.stakind3;
    this.stakind4 = data.stakind4;
    this.stakind5 = data.stakind5;
    this.staop1 = data.staop1;
    this.staop2 = data.staop2;
    this.staop3 = data.staop3;
    this.staop4 = data.staop4;
    this.staop5 = data.staop5;
    this.stacoll1 = data.stacoll1;
    this.stacoll2 = data.stacoll2;
    this.stacoll3 = data.stacoll3;
    this.stacoll4 = data.stacoll4;
    this.stacoll5 = data.stacoll5;
    this.stanumbers1 = data.stanumbers1;
    this.stanumbers2 = data.stanumbers2;
    this.stanumbers3 = data.stanumbers3;
    this.stanumbers4 = data.stanumbers4;
    this.stanumbers5 = data.stanumbers5;
    this.stavalues1 = data.stavalues1;
    this.stavalues2 = data.stavalues2;
    this.stavalues3 = data.stavalues3;
    this.stavalues4 = data.stavalues4;
    this.stavalues5 = data.stavalues5;
  }
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
export class pg_statistic_ext implements pg_statistic_ext {
  oid: any;
  stxrelid: any;
  stxname: any;
  stxnamespace: any;
  stxowner: any;
  stxkeys: any;
  stxkind: any;
  constructor(data: pg_statistic_ext) {
    this.oid = data.oid;
    this.stxrelid = data.stxrelid;
    this.stxname = data.stxname;
    this.stxnamespace = data.stxnamespace;
    this.stxowner = data.stxowner;
    this.stxkeys = data.stxkeys;
    this.stxkind = data.stxkind;
  }
}
export interface pg_statistic_ext_data {
  stxoid: any;
  stxdndistinct: any | null;
  stxddependencies: any | null;
  stxdmcv: any | null;
}
export class pg_statistic_ext_data implements pg_statistic_ext_data {
  stxoid: any;
  stxdndistinct: any | null;
  stxddependencies: any | null;
  stxdmcv: any | null;
  constructor(data: pg_statistic_ext_data) {
    this.stxoid = data.stxoid;
    this.stxdndistinct = data.stxdndistinct;
    this.stxddependencies = data.stxddependencies;
    this.stxdmcv = data.stxdmcv;
  }
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
export class pg_subscription implements pg_subscription {
  oid: any;
  subdbid: any;
  subname: any;
  subowner: any;
  subenabled: boolean;
  subconninfo: string;
  subslotname: any;
  subsynccommit: string;
  subpublications: any;
  constructor(data: pg_subscription) {
    this.oid = data.oid;
    this.subdbid = data.subdbid;
    this.subname = data.subname;
    this.subowner = data.subowner;
    this.subenabled = data.subenabled;
    this.subconninfo = data.subconninfo;
    this.subslotname = data.subslotname;
    this.subsynccommit = data.subsynccommit;
    this.subpublications = data.subpublications;
  }
}
export interface pg_subscription_rel {
  srsubid: any;
  srrelid: any;
  srsubstate: any;
  srsublsn: any;
}
export class pg_subscription_rel implements pg_subscription_rel {
  srsubid: any;
  srrelid: any;
  srsubstate: any;
  srsublsn: any;
  constructor(data: pg_subscription_rel) {
    this.srsubid = data.srsubid;
    this.srrelid = data.srrelid;
    this.srsubstate = data.srsubstate;
    this.srsublsn = data.srsublsn;
  }
}
export interface pg_tablespace {
  oid: any;
  spcname: any;
  spcowner: any;
  spcacl: any | null;
  spcoptions: any | null;
}
export class pg_tablespace implements pg_tablespace {
  oid: any;
  spcname: any;
  spcowner: any;
  spcacl: any | null;
  spcoptions: any | null;
  constructor(data: pg_tablespace) {
    this.oid = data.oid;
    this.spcname = data.spcname;
    this.spcowner = data.spcowner;
    this.spcacl = data.spcacl;
    this.spcoptions = data.spcoptions;
  }
}
export interface pg_transform {
  oid: any;
  trftype: any;
  trflang: any;
  trffromsql: any;
  trftosql: any;
}
export class pg_transform implements pg_transform {
  oid: any;
  trftype: any;
  trflang: any;
  trffromsql: any;
  trftosql: any;
  constructor(data: pg_transform) {
    this.oid = data.oid;
    this.trftype = data.trftype;
    this.trflang = data.trflang;
    this.trffromsql = data.trffromsql;
    this.trftosql = data.trftosql;
  }
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
export class pg_trigger implements pg_trigger {
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
  constructor(data: pg_trigger) {
    this.oid = data.oid;
    this.tgrelid = data.tgrelid;
    this.tgname = data.tgname;
    this.tgfoid = data.tgfoid;
    this.tgtype = data.tgtype;
    this.tgenabled = data.tgenabled;
    this.tgisinternal = data.tgisinternal;
    this.tgconstrrelid = data.tgconstrrelid;
    this.tgconstrindid = data.tgconstrindid;
    this.tgconstraint = data.tgconstraint;
    this.tgdeferrable = data.tgdeferrable;
    this.tginitdeferred = data.tginitdeferred;
    this.tgnargs = data.tgnargs;
    this.tgattr = data.tgattr;
    this.tgargs = data.tgargs;
    this.tgqual = data.tgqual;
    this.tgoldtable = data.tgoldtable;
    this.tgnewtable = data.tgnewtable;
  }
}
export interface pg_ts_config {
  oid: any;
  cfgname: any;
  cfgnamespace: any;
  cfgowner: any;
  cfgparser: any;
}
export class pg_ts_config implements pg_ts_config {
  oid: any;
  cfgname: any;
  cfgnamespace: any;
  cfgowner: any;
  cfgparser: any;
  constructor(data: pg_ts_config) {
    this.oid = data.oid;
    this.cfgname = data.cfgname;
    this.cfgnamespace = data.cfgnamespace;
    this.cfgowner = data.cfgowner;
    this.cfgparser = data.cfgparser;
  }
}
export interface pg_ts_config_map {
  mapcfg: any;
  maptokentype: number;
  mapseqno: number;
  mapdict: any;
}
export class pg_ts_config_map implements pg_ts_config_map {
  mapcfg: any;
  maptokentype: number;
  mapseqno: number;
  mapdict: any;
  constructor(data: pg_ts_config_map) {
    this.mapcfg = data.mapcfg;
    this.maptokentype = data.maptokentype;
    this.mapseqno = data.mapseqno;
    this.mapdict = data.mapdict;
  }
}
export interface pg_ts_dict {
  oid: any;
  dictname: any;
  dictnamespace: any;
  dictowner: any;
  dicttemplate: any;
  dictinitoption: string | null;
}
export class pg_ts_dict implements pg_ts_dict {
  oid: any;
  dictname: any;
  dictnamespace: any;
  dictowner: any;
  dicttemplate: any;
  dictinitoption: string | null;
  constructor(data: pg_ts_dict) {
    this.oid = data.oid;
    this.dictname = data.dictname;
    this.dictnamespace = data.dictnamespace;
    this.dictowner = data.dictowner;
    this.dicttemplate = data.dicttemplate;
    this.dictinitoption = data.dictinitoption;
  }
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
export class pg_ts_parser implements pg_ts_parser {
  oid: any;
  prsname: any;
  prsnamespace: any;
  prsstart: any;
  prstoken: any;
  prsend: any;
  prsheadline: any;
  prslextype: any;
  constructor(data: pg_ts_parser) {
    this.oid = data.oid;
    this.prsname = data.prsname;
    this.prsnamespace = data.prsnamespace;
    this.prsstart = data.prsstart;
    this.prstoken = data.prstoken;
    this.prsend = data.prsend;
    this.prsheadline = data.prsheadline;
    this.prslextype = data.prslextype;
  }
}
export interface pg_ts_template {
  oid: any;
  tmplname: any;
  tmplnamespace: any;
  tmplinit: any;
  tmpllexize: any;
}
export class pg_ts_template implements pg_ts_template {
  oid: any;
  tmplname: any;
  tmplnamespace: any;
  tmplinit: any;
  tmpllexize: any;
  constructor(data: pg_ts_template) {
    this.oid = data.oid;
    this.tmplname = data.tmplname;
    this.tmplnamespace = data.tmplnamespace;
    this.tmplinit = data.tmplinit;
    this.tmpllexize = data.tmpllexize;
  }
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
export class pg_type implements pg_type {
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
  constructor(data: pg_type) {
    this.oid = data.oid;
    this.typname = data.typname;
    this.typnamespace = data.typnamespace;
    this.typowner = data.typowner;
    this.typlen = data.typlen;
    this.typbyval = data.typbyval;
    this.typtype = data.typtype;
    this.typcategory = data.typcategory;
    this.typispreferred = data.typispreferred;
    this.typisdefined = data.typisdefined;
    this.typdelim = data.typdelim;
    this.typrelid = data.typrelid;
    this.typelem = data.typelem;
    this.typarray = data.typarray;
    this.typinput = data.typinput;
    this.typoutput = data.typoutput;
    this.typreceive = data.typreceive;
    this.typsend = data.typsend;
    this.typmodin = data.typmodin;
    this.typmodout = data.typmodout;
    this.typanalyze = data.typanalyze;
    this.typalign = data.typalign;
    this.typstorage = data.typstorage;
    this.typnotnull = data.typnotnull;
    this.typbasetype = data.typbasetype;
    this.typtypmod = data.typtypmod;
    this.typndims = data.typndims;
    this.typcollation = data.typcollation;
    this.typdefaultbin = data.typdefaultbin;
    this.typdefault = data.typdefault;
    this.typacl = data.typacl;
  }
}
export interface pg_user_mapping {
  oid: any;
  umuser: any;
  umserver: any;
  umoptions: any | null;
}
export class pg_user_mapping implements pg_user_mapping {
  oid: any;
  umuser: any;
  umserver: any;
  umoptions: any | null;
  constructor(data: pg_user_mapping) {
    this.oid = data.oid;
    this.umuser = data.umuser;
    this.umserver = data.umserver;
    this.umoptions = data.umoptions;
  }
}