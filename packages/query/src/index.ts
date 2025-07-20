// @ts-nocheck
import { print as gqlPrint } from 'graphql';
import inflection from 'inflection';

import { createOne, deleteOne,getAll, getMany, getOne, patchOne } from './ast';
import { validateMetaObject } from './meta-object';
export * as MetaObject from './meta-object';

const isObject = val => val !== null && typeof val === 'object';

export class QueryBuilder {
  constructor({ meta = {}, introspection }) {
    this._introspection = introspection;
    this._meta = meta;
    this.clear();
    this.initModelMap();
    this.pickScalarFields = pickScalarFields.bind(this);
    this.pickAllFields = pickAllFields.bind(this);

    const result = validateMetaObject(this._meta);
    if (typeof result === 'object' && result.errors) {
      throw new Error(`QueryBuilder: meta object is invalid:\n${result.message}`);
    }
  }

  /*
   * Save all gql queries and mutations by model name for quicker lookup
   */
  initModelMap() {
    this._models = Object.keys(this._introspection).reduce((map, key) => {
      const defn = this._introspection[key];
      map = {
        ...map,
        [defn.model]: {
          ...map[defn.model],
          ...{ [key]: defn }
        }
      };
      return map;
    }, {});
  }

  clear() {
    this._model = '';
    this._fields = [];
    this._key = null;
    this._queryName = '';
    this._ast = null;
    this._edges = false;
  }

  query(model) {
    this.clear();
    this._model = model;
    return this;
  }

  _findQuery() {
    // based on the op, finds the relevant GQL query
    const queries = this._models[this._model];
    if (!queries) {
      throw new Error('No queries found for ' + this._model);
    }

    const matchQuery = Object.entries(queries).find(
      ([_, defn]) => defn.qtype === this._op
    );

    if (!matchQuery) {
      throw new Error('No query found for ' + this._model + ':' + this._op);
    }

    const queryKey = matchQuery[0];
    return queryKey;
  }

  _findMutation() {
    // For mutation, there can be many defns that match the operation being requested
    // .ie: deleteAction, deleteActionBySlug, deleteActionByName
    const matchingDefns = Object.keys(this._introspection).reduce(
      (arr, mutationKey) => {
        const defn = this._introspection[mutationKey];
        if (
          defn.model === this._model &&
          defn.qtype === this._op &&
          defn.qtype === 'mutation' &&
          defn.mutationType === this._mutation
        ) {
          arr = [...arr, { defn, mutationKey }];
        }
        return arr;
      },
      []
    );

    if (!matchingDefns.length === 0) {
      throw new Error(
        'no mutation found for ' + this._model + ':' + this._mutation
      );
    }

    // We only need deleteAction from all of [deleteAction, deleteActionBySlug, deleteActionByName]
    const getInputName = (mutationType) => {
      switch (mutationType) {
      case 'delete': {
        return `Delete${inflection.camelize(this._model)}Input`;
      }
      case 'create': {
        return `Create${inflection.camelize(this._model)}Input`;
      }
      case 'patch': {
        return `Update${inflection.camelize(this._model)}Input`;
      }
      default:
        throw new Error('Unhandled mutation type' + mutationType);
      }
    };

    const matchDefn = matchingDefns.find(
      ({ defn }) => defn.properties.input.type === getInputName(this._mutation)
    );

    if (!matchDefn) {
      throw new Error(
        'no mutation found for ' + this._model + ':' + this._mutation
      );
    }

    return matchDefn.mutationKey;
  }

  select(selection) {
    const defn = this._introspection[this._key];

    // If selection not given, pick only scalar fields
    if (selection == null) {
      this._select = this.pickScalarFields(null, defn);
      return this;
    }

    this._select = this.pickAllFields(selection, defn);
    return this;
  }

  edges(useEdges) {
    this._edges = useEdges;
    return this;
  }

  getMany({ select } = {}) {
    this._op = 'getMany';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = getMany({
      builder: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      selection: this._select
    });

    return this;
  }

  all({ select } = {}) {
    this._op = 'getMany';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query', 'all'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = getAll({
      builder: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      selection: this._select
    });

    return this;
  }

  getOne({ select } = {}) {
    this._op = 'getOne';
    this._key = this._findQuery();

    this.queryName(
      inflection.camelize(
        ['get', inflection.underscore(this._key), 'query'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];
    this.select(select);
    this._ast = getOne({
      builder: this,
      queryName: this._queryName,
      operationName: this._key,
      query: defn,
      selection: this._select
    });

    return this;
  }

  create({ select } = {}) {
    this._op = 'mutation';
    this._mutation = 'create';
    this._key = this._findMutation();

    this.queryName(
      inflection.camelize(
        [inflection.underscore(this._key), 'mutation'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];
    this.select(select);
    this._ast = createOne({
      builder: this,
      operationName: this._key,
      mutationName: this._queryName,
      mutation: defn,
      selection: this._select
    });

    return this;
  }

  delete({ select } = {}) {
    this._op = 'mutation';
    this._mutation = 'delete';
    this._key = this._findMutation();

    this.queryName(
      inflection.camelize(
        [inflection.underscore(this._key), 'mutation'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = deleteOne({
      builder: this,
      operationName: this._key,
      mutationName: this._queryName,
      mutation: defn,
      selection: this._select
    });

    return this;
  }

  update({ select } = {}) {
    this._op = 'mutation';
    this._mutation = 'patch';
    this._key = this._findMutation();

    this.queryName(
      inflection.camelize(
        [inflection.underscore(this._key), 'mutation'].join('_'),
        true
      )
    );

    const defn = this._introspection[this._key];

    this.select(select);
    this._ast = patchOne({
      builder: this,
      operationName: this._key,
      mutationName: this._queryName,
      mutation: defn,
      selection: this._select
    });

    return this;
  }

  queryName(name) {
    this._queryName = name;
    return this;
  }

  print() {
    this._hash = gqlPrint(this._ast);
    return this;
  }
}

/**
 * Pick scalar fields of a query definition
 * @param {Object} defn Query definition
 * @param {Object} meta Meta object containing info about table relations
 * @returns {Array}
 */
function pickScalarFields(selection, defn) {
  const model = defn.model;
  const modelMeta = this._meta.tables.find((t) => t.name === model);

  const isInTableSchema = (fieldName) =>
    !!modelMeta.fields.find((field) => field.name === fieldName);

  const pickFrom = (modelSelection) =>
    modelSelection
      .filter((fieldName) => {
        // If not specified or not a valid selection list, allow all
        if (selection == null || !Array.isArray(selection)) return true;
        return selection.includes(fieldName);
      })
      .filter(
        (fieldName) =>
          !isRelationalField(fieldName, modelMeta) && isInTableSchema(fieldName)
      )
      .map((fieldName) => ({
        name: fieldName,
        isObject: false,
        fieldDefn: modelMeta.fields.find((f) => f.name === fieldName)
      }));

  // This is for inferring the sub-selection of a mutation query
  // from a definition model .eg UserSetting, find its related queries in the introspection object, and pick its selection fields
  if (defn.qtype === 'mutation') {
    const relatedQuery = this._introspection[
      `${modelNameToGetMany(defn.model)}`
    ];
    return pickFrom(relatedQuery.selection);
  }

  return pickFrom(defn.selection);
}

/**
 * Pick scalar fields and sub-selection fields of a query definition
 * @param {Object} selection Selection clause object
 * @param {Object} defn Query definition
 * @param {Object} meta Meta object containing info about table relations
 * @returns {Array}
 */
function pickAllFields(selection, defn) {
  const model = defn.model;
  const modelMeta = this._meta.tables.find((t) => t.name === model);
  const selectionEntries = Object.entries(selection);
  let fields = [];

  const isWhiteListed = (selectValue) => {
    return typeof selectValue === 'boolean' && selectValue;
  };

  for (const entry of selectionEntries) {
    const [fieldName, fieldOptions] = entry;
    // Case
    // {
    //   goalResults: // fieldName
    //    { select: { id: true }, variables: { first: 100 } } // fieldOptions
    // }
    if (isObject(fieldOptions)) {
      if (!isFieldInDefinition(fieldName, defn, modelMeta, this)) {
        continue;
      }

      const referencedForeignConstraint = modelMeta.foreignConstraints.find(
        (constraint) =>
          constraint.fromKey.name === fieldName ||
          constraint.fromKey.alias === fieldName
      );

      const subFields = Object.keys(fieldOptions.select).filter((subField) => {
        return (
          !isRelationalField(subField, modelMeta) &&
          isWhiteListed(fieldOptions.select[subField])
        );
      });

      const isBelongTo = !!referencedForeignConstraint;

      const fieldSelection = {
        name: fieldName,
        isObject: true,
        isBelongTo,
        selection: subFields,
        variables: fieldOptions.variables
      };

      // Need to further expand selection of object fields,
      // but only non-graphql-builtin, non-relation fields
      // .ie action { id location }
      // location is non-scalar and non-relational, thus need to further expand into { x y ... }
      if (isBelongTo) {
        const getManyName = modelNameToGetMany(
          referencedForeignConstraint.refTable
        );
        const refDefn = this._introspection[getManyName];
        fieldSelection.selection = pickScalarFields.call(
          this,
          subFields,
          refDefn
        );
      }

      fields = [...fields, fieldSelection];
    } else {
      // Case
      // {
      //   userId: true // [fieldName, fieldOptions]
      // }
      if (isWhiteListed(fieldOptions)) {
        fields = [
          ...fields,
          {
            name: fieldName,
            isObject: false,
            fieldDefn: modelMeta.fields.find((f) => f.name === fieldName)
          }
        ];
      }
    }
  }

  return fields;
}

function isFieldInDefinition(fieldName, defn, modelMeta) {
  const isReferenced = !!modelMeta.foreignConstraints.find(
    (constraint) =>
      constraint.fromKey.name === fieldName ||
      constraint.fromKey.alias === fieldName
  );

  return (
    isReferenced ||
    defn.selection.some((selectionItem) => {
      if (typeof selectionItem === 'string') {
        return fieldName === selectionItem;
      }
      if (isObject(selectionItem)) {
        return selectionItem.name === fieldName;
      }
      return false;
    })
  );
}

// TODO: see if there is a possibility of supertyping table (a key is both a foreign and primary key)
// A relational field is a foreign key but not a primary key
function isRelationalField(fieldName, modelMeta) {
  return (
    !modelMeta.primaryConstraints.find((field) => field.name === fieldName) &&
    !!modelMeta.foreignConstraints.find(
      (constraint) => constraint.fromKey.name === fieldName
    )
  );
}

// Get getMany op name from model
// ie. UserSetting => userSettings
function modelNameToGetMany(model) {
  return inflection.camelize(
    inflection.pluralize(inflection.underscore(model)),
    true
  );
}
