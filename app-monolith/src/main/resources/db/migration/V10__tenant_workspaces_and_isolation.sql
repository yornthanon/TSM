-- Shared database, isolated rows: existing data is preserved in one legacy workspace.
CREATE TABLE tenant_workspaces (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    owner_user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_by VARCHAR(255)
);

INSERT INTO tenant_workspaces (id, name, status, created_by)
VALUES (1, 'Legacy TicketDesk Workspace', 'ACTIVE', 'SYSTEM');
SELECT setval(pg_get_serial_sequence('tenant_workspaces', 'id'),
              (SELECT COALESCE(MAX(id), 1) FROM tenant_workspaces));

ALTER TABLE users ADD COLUMN tenant_id BIGINT;
ALTER TABLE users ADD CONSTRAINT fk_users_tenant_workspace
    FOREIGN KEY (tenant_id) REFERENCES tenant_workspaces(id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

ALTER TABLE event ADD COLUMN tenant_id BIGINT;
UPDATE event SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE event ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE event ADD CONSTRAINT fk_event_tenant_workspace
    FOREIGN KEY (tenant_id) REFERENCES tenant_workspaces(id);
CREATE INDEX idx_event_tenant_id ON event(tenant_id);

ALTER TABLE tt_ticket ADD COLUMN tenant_id BIGINT;
UPDATE tt_ticket SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE tt_ticket ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE tt_ticket ADD CONSTRAINT fk_ticket_tenant_workspace
    FOREIGN KEY (tenant_id) REFERENCES tenant_workspaces(id);
CREATE INDEX idx_ticket_tenant_id ON tt_ticket(tenant_id);

ALTER TABLE tt_order ADD COLUMN tenant_id BIGINT;
UPDATE tt_order SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE tt_order ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE tt_order ADD CONSTRAINT fk_order_tenant_workspace
    FOREIGN KEY (tenant_id) REFERENCES tenant_workspaces(id);
CREATE INDEX idx_order_tenant_id ON tt_order(tenant_id);

ALTER TABLE tt_payment ADD COLUMN tenant_id BIGINT;
UPDATE tt_payment SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE tt_payment ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE tt_payment ADD CONSTRAINT fk_payment_tenant_workspace
    FOREIGN KEY (tenant_id) REFERENCES tenant_workspaces(id);
CREATE INDEX idx_payment_tenant_id ON tt_payment(tenant_id);

ALTER TABLE tt_notification ADD COLUMN tenant_id BIGINT;
UPDATE tt_notification SET tenant_id = 1 WHERE tenant_id IS NULL;
ALTER TABLE tt_notification ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE tt_notification ADD CONSTRAINT fk_notification_tenant_workspace
    FOREIGN KEY (tenant_id) REFERENCES tenant_workspaces(id);
CREATE INDEX idx_notification_tenant_id ON tt_notification(tenant_id);
