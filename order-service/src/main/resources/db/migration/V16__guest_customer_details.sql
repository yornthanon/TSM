-- Store buyer details for public guest checkout orders.
ALTER TABLE tt_order ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE tt_order ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(320);
ALTER TABLE tt_order ADD COLUMN IF NOT EXISTS phone_number VARCHAR(64);
