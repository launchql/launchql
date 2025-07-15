-- Deploy tagged-linear:add_discounts to pg
-- requires: create_orders

BEGIN;

CREATE TABLE app.discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL
);

ALTER TABLE app.orders ADD COLUMN discount_id UUID REFERENCES app.discounts(id);

COMMIT;