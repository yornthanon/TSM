-- Enforce at most one active Tenant Admin per workspace at the database layer.
-- The boolean is maintained from the existing TENANT_ADMIN role assignment by triggers.
ALTER TABLE users ADD COLUMN tenant_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Do not delete or silently reassign existing role grants. If production data
-- contains duplicates, fail the migration so an administrator can explicitly
-- choose the replacement account before enabling the invariant.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id AND r.name = 'TENANT_ADMIN'
        JOIN users u ON u.id = ur.user_id
        WHERE u.tenant_id IS NOT NULL AND u.status = 'ACTIVE'
        GROUP BY u.tenant_id
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'V13 blocked: more than one active TENANT_ADMIN exists in a workspace; resolve explicitly without data loss';
    END IF;
END;
$$;

UPDATE users u
SET tenant_admin = EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id AND r.name = 'TENANT_ADMIN'
);

CREATE UNIQUE INDEX uq_one_active_tenant_admin_per_workspace
    ON users (tenant_id)
    WHERE tenant_id IS NOT NULL AND tenant_admin = TRUE AND status = 'ACTIVE';

CREATE OR REPLACE FUNCTION sync_tenant_admin_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    tenant_admin_role_id BIGINT;
    affected_user_id BIGINT;
BEGIN
    SELECT id INTO tenant_admin_role_id FROM roles WHERE name = 'TENANT_ADMIN';
    IF tenant_admin_role_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
    END IF;
    affected_user_id := COALESCE(NEW.user_id, OLD.user_id);
    UPDATE users u
       SET tenant_admin = EXISTS (
           SELECT 1 FROM user_roles ur
           WHERE ur.user_id = u.id AND ur.role_id = tenant_admin_role_id
       )
     WHERE u.id = affected_user_id;
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

CREATE TRIGGER trg_sync_tenant_admin_flag
AFTER INSERT OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION sync_tenant_admin_flag();

-- A token is the only public locator for an event. It is never exposed by the
-- normal EventResponse DTO and is replaced on regeneration.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE event ADD COLUMN share_token VARCHAR(64);
UPDATE event
SET share_token = encode(gen_random_bytes(32), 'hex')
WHERE share_token IS NULL;
ALTER TABLE event ALTER COLUMN share_token SET NOT NULL;
ALTER TABLE event ADD CONSTRAINT uq_event_share_token UNIQUE (share_token);
CREATE INDEX idx_event_share_token ON event(share_token);
