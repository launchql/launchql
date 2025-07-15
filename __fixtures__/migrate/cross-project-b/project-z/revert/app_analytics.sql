-- Revert project-z:app_analytics from pg

BEGIN;

-- Clean up config entries
DELETE FROM core.config WHERE key LIKE 'analytics.last_event.%';

DROP FUNCTION IF EXISTS app.log_analytics_event(TEXT, JSONB, UUID) CASCADE;
DROP TABLE IF EXISTS app.analytics_metrics CASCADE;
DROP TABLE IF EXISTS app.analytics_events CASCADE;

COMMIT;