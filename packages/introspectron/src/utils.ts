export const parseTags = (
  str: string
): { tags: Record<string, string | boolean | (string | boolean)[]>; text: string } => {
  return str.split(/\r?\n/).reduce(
    (
      prev: { tags: Record<string, string | boolean | (string | boolean)[]>; text: string },
      curr: string
    ) => {
      if (prev.text !== '') {
        return { ...prev, text: `${prev.text}\n${curr}` };
      }
      const match = curr.match(/^@[a-zA-Z][a-zA-Z0-9_]*($|\s)/);
      if (!match) {
        return { ...prev, text: curr };
      }
      const key = match[0].substr(1).trim();
      const value = match[0] === curr ? true : curr.replace(match[0], '');
      return {
        ...prev,
        tags: {
          ...prev.tags,
          [key]: !Object.prototype.hasOwnProperty.call(prev.tags, key)
            ? value
            : Array.isArray(prev.tags[key])
              ? [...(prev.tags[key] as (string | boolean)[]), value]
              : [prev.tags[key], value]
        }
      };
    },
    {
      tags: {} as Record<string, string | boolean | (string | boolean)[]>,
      text: ''
    }
  );
};

export const deepClone = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((val) => deepClone(val)) as unknown as T;
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((memo, k) => {
      (memo as any)[k] = deepClone((value as any)[k]);
      return memo;
    }, {} as any) as T;
  } else {
    return value;
  }
};
