-- notification-service baseline schema
CREATE TABLE tt_notification (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    order_id BIGINT,
    event_type VARCHAR(255),
    notification_type VARCHAR(255),
    recipient VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    notification_status VARCHAR(255),
    error_message VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);
