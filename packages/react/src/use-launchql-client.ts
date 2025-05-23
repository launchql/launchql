import { useMemo } from 'react';
import { QueryBuilder, MetaObject } from '@launchql/query';
import { useIntrospection } from './use-introspection';
import { useSchemaMeta } from './use-schema-meta';

export function useLaunchqlQuery() {
  const introspection = useIntrospection();
  const meta = useSchemaMeta();

  return useMemo(() => {
    if (!meta.data || !introspection.data) return null;
    return new QueryBuilder({
      meta: MetaObject.convertFromMetaSchema({ _meta: meta.data }),
      introspection: introspection.data
    });
  }, [introspection.data, meta.data]);
}
