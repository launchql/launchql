import type { ManyToManyRelation, PgBuild, PgClass, PgConstraint } from './types';

const arraysAreEqual = (array1: number[], array2: number[]): boolean =>
  array1.length === array2.length && array1.every((value, index) => array2[index] === value);

const getManyToManyRelations = (leftTable: PgClass, build: PgBuild): ManyToManyRelation[] => {
  const {
    pgIntrospectionResultsByKind: introspectionResultsByKind,
    pgOmit: omit
  } = build;

  return leftTable.foreignConstraints
    .filter((constraint) => constraint.type === 'f')
    .reduce<ManyToManyRelation[]>((memoLeft, junctionLeftConstraint) => {
      if (
        omit(junctionLeftConstraint, 'read') ||
        omit(junctionLeftConstraint, 'manyToMany')
      ) {
        return memoLeft;
      }

      const junctionTable =
        introspectionResultsByKind.classById[String(junctionLeftConstraint.classId)] ??
        junctionLeftConstraint.foreignClass;

      if (!junctionTable) {
        throw new Error(
          `Could not find the table that referenced us (constraint: ${junctionLeftConstraint.name})`
        );
      }

      if (omit(junctionTable, 'read') || omit(junctionTable, 'manyToMany')) {
        return memoLeft;
      }

      const memoRight = junctionTable.constraints
        .filter(
          (constraint) =>
            constraint.id !== junctionLeftConstraint.id &&
            constraint.type === 'f' &&
            !omit(constraint, 'read') &&
            !omit(constraint, 'manyToMany')
        )
        .reduce<ManyToManyRelation[]>((memoRightInner, junctionRightConstraint) => {
          const rightTable =
            junctionRightConstraint.foreignClass ??
            (junctionRightConstraint.foreignClassId !== undefined
              ? introspectionResultsByKind.classById[
                  String(junctionRightConstraint.foreignClassId)
                ]
              : undefined);

          if (!rightTable || omit(rightTable, 'read') || omit(rightTable, 'manyToMany')) {
            return memoRightInner;
          }

          const leftKeyAttributes = junctionLeftConstraint.foreignKeyAttributes;
          const junctionLeftKeyAttributes = junctionLeftConstraint.keyAttributes;
          const junctionRightKeyAttributes = junctionRightConstraint.keyAttributes;
          const rightKeyAttributes = junctionRightConstraint.foreignKeyAttributes;

          if (
            !leftKeyAttributes.every(Boolean) ||
            !junctionLeftKeyAttributes.every(Boolean) ||
            !junctionRightKeyAttributes.every(Boolean) ||
            !rightKeyAttributes.every(Boolean)
          ) {
            throw new Error('Could not find key columns!');
          }

          if (
            leftKeyAttributes.some((attr) => omit(attr, 'read')) ||
            junctionLeftKeyAttributes.some((attr) => omit(attr, 'read')) ||
            junctionRightKeyAttributes.some((attr) => omit(attr, 'read')) ||
            rightKeyAttributes.some((attr) => omit(attr, 'read'))
          ) {
            return memoRightInner;
          }

          if (leftKeyAttributes.length > 1 || rightKeyAttributes.length > 1) {
            return memoRightInner;
          }

          const junctionLeftConstraintIsUnique = junctionTable.constraints.some(
            (constraint) =>
              ['p', 'u'].includes(constraint.type) &&
              arraysAreEqual(
                constraint.keyAttributeNums,
                junctionLeftKeyAttributes.map((attr) => attr.num)
              )
          );
          const junctionRightConstraintIsUnique = junctionTable.constraints.some(
            (constraint) =>
              ['p', 'u'].includes(constraint.type) &&
              arraysAreEqual(
                constraint.keyAttributeNums,
                junctionRightKeyAttributes.map((attr) => attr.num)
              )
          );

          if (junctionLeftConstraintIsUnique || junctionRightConstraintIsUnique) {
            return memoRightInner;
          }

          const allowsMultipleEdgesToNode = !junctionTable.constraints.find(
            (constraint: PgConstraint) =>
              ['p', 'u'].includes(constraint.type) &&
              arraysAreEqual(
                constraint.keyAttributeNums.concat().sort(),
                [
                  ...junctionLeftKeyAttributes.map((attr) => attr.num),
                  ...junctionRightKeyAttributes.map((attr) => attr.num)
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

export default getManyToManyRelations;
