-- event-service baseline schema
CREATE TABLE event (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    event_date TIMESTAMP,
    base_price NUMERIC(19,2),
    capacity INTEGER,
    event_type VARCHAR(255),
    status VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by VARCHAR(255)
);
