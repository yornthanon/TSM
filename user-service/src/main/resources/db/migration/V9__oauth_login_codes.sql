CREATE TABLE oauth_login_codes (
    code_hash   VARCHAR(64) PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oauth_login_codes_user_id ON oauth_login_codes(user_id);
CREATE INDEX idx_oauth_login_codes_expires_at ON oauth_login_codes(expires_at);
