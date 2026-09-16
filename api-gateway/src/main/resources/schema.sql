CREATE TABLE IF NOT EXISTS api_route (
    id                   BIGSERIAL PRIMARY KEY,
    uri                  VARCHAR(255) NOT NULL,
    path                 VARCHAR(255) NOT NULL,
    method               VARCHAR(50),
    description          VARCHAR(500),
    group_code           VARCHAR(100),
    rate_limited         INTEGER,
    rate_limit_duration  INTEGER,
    status               VARCHAR(50) DEFAULT 'ACTIVE',
    created_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_at           TIMESTAMP,
    updated_by           VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS request_logs (
    id               BIGSERIAL PRIMARY KEY,
    request_id       VARCHAR(100),
    correlation_id   VARCHAR(100),
    method           VARCHAR(20),
    uri              VARCHAR(1000),
    path             VARCHAR(500),
    client_ip        VARCHAR(100),
    user_agent       VARCHAR(500),
    request_headers  TEXT,
    request_body     TEXT,
    request_size     BIGINT,
    response_status  INTEGER,
    response_headers TEXT,
    duration_ms      BIGINT,
    service_name     VARCHAR(100),
    created_at       TIMESTAMP
);