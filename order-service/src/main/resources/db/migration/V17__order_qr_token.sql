-- Secure ticket token generated after successful demo payment/order completion.
ALTER TABLE tt_order ADD COLUMN IF NOT EXISTS qr_token VARCHAR(128);
CREATE UNIQUE INDEX IF NOT EXISTS uk_order_qr_token ON tt_order (qr_token) WHERE qr_token IS NOT NULL;
