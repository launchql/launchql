-- Revert schemas/public/domains/attachment from pg

BEGIN;

DROP TYPE public.attachment;

COMMIT;
