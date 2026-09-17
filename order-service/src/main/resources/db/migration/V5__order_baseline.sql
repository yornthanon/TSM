-- order-service baseline schema
CREATE TABLE tt_order (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255),
    ticket_id BIGINT,
    event_id BIGINT,
    amount NUMERIC(19,2),
    quantity INTEGER,
    payment_id BIGINT,
    order_status VARCHAR(255) NOT NULL,
    order_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by VARCHAR(255)
);
