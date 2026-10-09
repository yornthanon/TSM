-- User-level visibility: a normal Google user sees their own workspace by default.
-- Tenant/platform admin may grant read access to additional workspaces.
CREATE TABLE tenant_access_grants (
    id BIGSERIAL PRIMARY KEY,
    grantee_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id BIGINT NOT NULL REFERENCES tenant_workspaces(id) ON DELETE CASCADE,
    granted_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_tenant_access_grant UNIQUE (grantee_user_id, tenant_id)
);
CREATE INDEX idx_tenant_access_grants_grantee ON tenant_access_grants(grantee_user_id);
CREATE INDEX idx_tenant_access_grants_tenant ON tenant_access_grants(tenant_id);
