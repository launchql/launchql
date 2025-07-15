-- Deploy tagged-linear:create_payments to pg
-- requires: create_orders

BEGIN;

CREATE TABLE app.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES app.orders(id),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed'))
);

COMMIT;