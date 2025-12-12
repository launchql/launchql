import type { PgAttribute, PgClass, PgConstraint } from 'graphile-build-pg';

import type { ManyToManyRelationship } from './types';

const arraysAreEqual = (array1: readonly number[], array2: readonly number[]): boolean =>
  array1.length === array2.length && array1.every((el, i) => array2[i] === el);

const isUniqueConstraint = (constraint: PgConstraint, attributes: PgAttribute[]): boolean =>
  ['p', 'u'].includes(constraint.type) &&
  arraysAreEqual(
    constraint.keyAttributeNums,
    attributes.map((attr) => attr.num)
  );

// Given a `leftTable`, trace through the foreign key relations
// and identify a `junctionTable` and `rightTable`.
// Returns a list of data objects for these many-to-many relationships.
const manyToManyRelationships = (leftTable: PgClass, build: any): ManyToManyRelationship[] => {
  const { pgIntrospectionResultsByKind: introspectionResultsByKind, pgOmit: omit } = build;

  return leftTable.foreignConstraints
    .filter((con) => con.type === 'f')
    .reduce<ManyToManyRelationship[]>((memoLeft, junctionLeftConstraint) => {
      if (omit(junctionLeftConstraint, 'read') || omit(junctionLeftConstraint, 'manyToMany')) {
        return memoLeft;
      }
      const junctionTable =
        introspectionResultsByKind.classById[junctionLeftConstraint.classId];
      if (!junctionTable) {
        throw new Error(
          `Could not find the table that referenced us (constraint: ${junctionLeftConstraint.name})`
        );
      }
      if (omit(junctionTable, 'read') || omit(junctionTable, 'manyToMany')) {
        return memoLeft;
      }
      const memoRight = (junctionTable.constraints as PgConstraint[])
        .filter(
          (con: PgConstraint) =>
            con.id !== junctionLeftConstraint.id &&
            con.type === 'f' &&
            !omit(con, 'read') &&
            !omit(con, 'manyToMany')
        )
        .reduce<ManyToManyRelationship[]>((memoRightInner, junctionRightConstraint: PgConstraint) => {
          const rightTable = junctionRightConstraint.foreignClass;
          if (omit(rightTable, 'read') || omit(rightTable, 'manyToMany')) {
            return memoRightInner;
          }

          const leftKeyAttributes = junctionLeftConstraint.foreignKeyAttributes;
          const junctionLeftKeyAttributes = junctionLeftConstraint.keyAttributes;
          const junctionRightKeyAttributes = junctionRightConstraint.keyAttributes;
          const rightKeyAttributes = junctionRightConstraint.foreignKeyAttributes;

          // Ensure keys were found
          if (
            !leftKeyAttributes.every(Boolean) ||
            !junctionLeftKeyAttributes.every(Boolean) ||
            !junctionRightKeyAttributes.every(Boolean) ||
            !rightKeyAttributes.every(Boolean)
          ) {
            throw new Error('Could not find key columns!');
          }

          // Ensure keys can be read
          if (
            leftKeyAttributes.some((attr: PgAttribute) => omit(attr, 'read')) ||
            junctionLeftKeyAttributes.some((attr: PgAttribute) => omit(attr, 'read')) ||
            junctionRightKeyAttributes.some((attr: PgAttribute) => omit(attr, 'read')) ||
            rightKeyAttributes.some((attr: PgAttribute) => omit(attr, 'read'))
          ) {
            return memoRightInner;
          }

          // Ensure both constraints are single-column
          // TODO: handle multi-column
          if (leftKeyAttributes.length > 1 || rightKeyAttributes.length > 1) {
            return memoRightInner;
          }

          // Ensure junction constraint keys are not unique (which would result in a one-to-one relation)
          const junctionLeftConstraintIsUnique = !!junctionTable.constraints.find((c: PgConstraint) =>
            isUniqueConstraint(c as any, junctionLeftKeyAttributes)
          );
          const junctionRightConstraintIsUnique = !!junctionTable.constraints.find((c: PgConstraint) =>
            isUniqueConstraint(c as any, junctionRightKeyAttributes)
          );
          if (junctionLeftConstraintIsUnique || junctionRightConstraintIsUnique) {
            return memoRightInner;
          }

          const allowsMultipleEdgesToNode = !junctionTable.constraints.find(
            (c: PgConstraint) =>
              ['p', 'u'].includes(c.type) &&
              arraysAreEqual(
                c.keyAttributeNums.concat().sort(),
                [
                  ...junctionLeftKeyAttributes.map((obj: PgAttribute) => obj.num),
                  ...junctionRightKeyAttributes.map((obj: PgAttribute) => obj.num)
                ].sort()
              )
          );

          return [
            ...memoRightInner,
            {
              leftKeyAttributes,
              junctionLeftKeyAttributes,
              junctionRightKeyAttributes,
              rightKeyAttributes,
              junctionTable,
              rightTable,
              junctionLeftConstraint,
              junctionRightConstraint,
              allowsMultipleEdgesToNode
            }
          ];
        }, []);
      return [...memoLeft, ...memoRight];
    }, []);
};

export default manyToManyRelationships;
