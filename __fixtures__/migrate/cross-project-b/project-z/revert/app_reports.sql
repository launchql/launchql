-- Revert project-z:app_reports from pg

DROP FUNCTION IF EXISTS app.generate_report(UUID, JSONB) CASCADE;
DROP MATERIALIZED VIEW IF EXISTS app.daily_activity_summary CASCADE;
DROP TABLE IF EXISTS app.scheduled_reports CASCADE;
DROP TABLE IF EXISTS app.report_definitions CASCADE;
