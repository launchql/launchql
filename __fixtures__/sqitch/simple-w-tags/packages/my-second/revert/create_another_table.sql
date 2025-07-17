-- Revert my-second:create_another_table from pg

BEGIN;

DROP TABLE otherschema.consent_agreements;
DROP TABLE otherschema.user_interactions;

COMMIT;
