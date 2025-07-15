-- Deploy tagged-linear:create_orders to pg
-- requires: create_users

BEGIN;

CREATE TABLE app.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app.users(id),
    order_date TIMESTAMPTZ DEFAULT NOW(),
    total_amount DECIMAL(10,2) NOT NULL
);

COMMIT;