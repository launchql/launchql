-- Revert my-second:create_another_table from pg

BEGIN;

DROP TABLE mysecondapp.user_interactions;
DROP TABLE mysecondapp.consent_agreements;

COMMIT;
