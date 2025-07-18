-- Deploy my-second:create_another_table to pg

-- requires: my-second:create_table

BEGIN;

-- Table 2: User Interactions
CREATE TABLE otherschema.user_interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES otherschema.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'hover', 'scroll', 'input')),
  target TEXT NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMPTZ DEFAULT now()
);

-- Table 3: Consent Agreements
CREATE TABLE otherschema.consent_agreements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES otherschema.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  version TEXT NOT NULL
);

COMMIT;
