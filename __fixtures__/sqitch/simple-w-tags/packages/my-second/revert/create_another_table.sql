-- Revert my-second:create_another_table from pg

BEGIN;

DROP TABLE otherschema.user_interactions;
DROP TABLE otherschema.consent_agreements;

COMMIT;
