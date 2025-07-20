import { deparse } from 'pgsql-deparser';
import { parse } from 'pgsql-parser';

type TransformProps = {
  [key: string]: ((value: any) => any) | { [key: string]: any };
};

/**
 * Recursively transforms the properties of an object based on a transformation map.
 * 
 * @param obj - The object to transform.
 * @param props - A map of properties and their transformation rules.
 * @returns A new object with transformed properties.
 */
export const transformProps = (obj: any, props: TransformProps): any => {
  let copy: any;

  // Handle primitive types, null, or undefined
  if (obj === null || typeof obj !== 'object') return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = transformProps(obj[i], props);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object || typeof obj === 'object') {
    copy = {};
    for (const attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        if (props.hasOwnProperty(attr)) {
          const propRule = props[attr];
          if (typeof propRule === 'function') {
            // Apply function transformation
            copy[attr] = propRule(obj[attr]);
          } else if (typeof propRule === 'object' && propRule !== null) {
            // Apply value-based transformation
            if (propRule.hasOwnProperty(obj[attr])) {
              copy[attr] = propRule[obj[attr]];
            } else {
              copy[attr] = transformProps(obj[attr], props);
            }
          }
        } else {
          copy[attr] = transformProps(obj[attr], props);
        }
      }
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};

/**
 * Parses a SQL statement, transforms its properties, and regenerates the SQL.
 * 
 * @param statement - The SQL statement to transform.
 * @param props - A map of properties and their transformation rules.
 * @returns The transformed SQL statement.
 */
export const transform = async (statement: string, props: TransformProps): Promise<string> => {
  let tree = await parse(statement);
  tree = transformProps(tree, props);
  return await deparse(tree as any);
};
