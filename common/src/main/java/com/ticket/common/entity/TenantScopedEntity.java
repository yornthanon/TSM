package com.ticket.common.entity;

import com.ticket.common.tenant.TenantContextHolder;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

/** Base for business rows whose visibility and writes belong to one workspace. */
@MappedSuperclass
@Getter
@Setter
public abstract class TenantScopedEntity extends BasedEntity {
    @Column(name = "tenant_id", nullable = false, updatable = false)
    private Long tenantId;

    @PrePersist
    protected void assignAndValidateTenant() {
        Long currentTenant = TenantContextHolder.getTenantId();
        if (tenantId == null) {
            if (currentTenant == null) {
                throw new IllegalStateException("A workspace must be selected before creating tenant data.");
            }
            tenantId = currentTenant;
        } else if (currentTenant == null || !tenantId.equals(currentTenant)) {
            throw new SecurityException("Cannot create data outside the active workspace.");
        }
    }

    @PreUpdate
    protected void validateTenantUpdate() {
        Long currentTenant = TenantContextHolder.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("Tenant-owned data must have a workspace.");
        }
        if (currentTenant == null && TenantContextHolder.isPlatformAdmin()) {
            return;
        }
        if (currentTenant == null || !tenantId.equals(currentTenant)) {
            throw new SecurityException("Cannot update data outside the active workspace.");
        }
    }
}
