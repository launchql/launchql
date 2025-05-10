import { useMemo } from 'react';
import { Client as LqlClient, MetaObject } from '@launchql/react-client';
import { useIntrospection } from './use-introspection';
import { useSchemaMeta } from './use-schema-meta';

export function useLaunchqlClient() {
  const introspection = useIntrospection();
  const meta = useSchemaMeta();

  return useMemo(() => {
    if (!meta.data || !introspection.data) return null;
    return new LqlClient({
      meta: MetaObject.convertFromMetaSchema({ _meta: meta.data }),
      introspection: introspection.data
    });
  }, [introspection.data, meta.data]);
}
