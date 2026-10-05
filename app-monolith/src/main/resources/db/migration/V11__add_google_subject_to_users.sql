-- Google `sub` is stable when a Google Account email changes; keep it as the provider identity key.
ALTER TABLE users ADD COLUMN google_subject VARCHAR(255);

CREATE UNIQUE INDEX uq_users_google_subject
    ON users (google_subject)
    WHERE google_subject IS NOT NULL;
