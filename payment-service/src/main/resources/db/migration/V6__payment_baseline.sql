-- payment-service baseline schema
CREATE TABLE tt_payment (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    username VARCHAR(255) NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    payment_status VARCHAR(255) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    currency VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    payment_date TIMESTAMP,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by VARCHAR(255)
);
