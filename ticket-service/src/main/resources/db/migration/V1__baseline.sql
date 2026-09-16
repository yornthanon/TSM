-- ticket-service baseline schema
CREATE TABLE tt_ticket (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    ticket_status VARCHAR(255) NOT NULL,
    seat_number VARCHAR(255) NOT NULL,
    price NUMERIC(19,2) NOT NULL,
    ticket_type VARCHAR(255) NOT NULL,
    locked_until TIMESTAMP,
    locked_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by VARCHAR(255)
);
