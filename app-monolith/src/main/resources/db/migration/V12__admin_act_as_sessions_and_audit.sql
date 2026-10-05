-- CEO-only act-as sessions are short-lived; request audit rows are append-only.
CREATE TABLE admin_act_as_sessions (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT NOT NULL,
    actor_email VARCHAR(320) NOT NULL,
    target_user_id BIGINT NOT NULL,
    target_email VARCHAR(320) NOT NULL,
    tenant_id BIGINT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_admin_act_as_tenant FOREIGN KEY (tenant_id) REFERENCES tenant_workspaces(id)
);
CREATE INDEX idx_admin_act_as_actor_started ON admin_act_as_sessions(actor_user_id, started_at DESC);
CREATE INDEX idx_admin_act_as_target_started ON admin_act_as_sessions(target_user_id, started_at DESC);

CREATE TABLE admin_act_as_audit (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES admin_act_as_sessions(id) ON DELETE RESTRICT,
    actor_user_id BIGINT NOT NULL,
    actor_email VARCHAR(320) NOT NULL,
    target_user_id BIGINT NOT NULL,
    target_email VARCHAR(320) NOT NULL,
    action VARCHAR(40) NOT NULL,
    http_method VARCHAR(12),
    request_path VARCHAR(512),
    response_status INTEGER,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_act_as_audit_session_time ON admin_act_as_audit(session_id, occurred_at DESC);
CREATE INDEX idx_admin_act_as_audit_time ON admin_act_as_audit(occurred_at DESC);
