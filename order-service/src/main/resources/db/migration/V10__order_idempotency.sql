ALTER TABLE tt_order ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS uk_order_idempotency
    ON tt_order (username, idempotency_key)
    WHERE idempotency_key IS NOT NULL;
