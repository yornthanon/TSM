package com.ticket.userservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_access_grants", uniqueConstraints = @UniqueConstraint(
        name = "uq_tenant_access_grant",
        columnNames = {"grantee_user_id", "tenant_id"}))
@Getter
@Setter
@NoArgsConstructor
public class TenantAccessGrant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grantee_user_id", nullable = false)
    private Long granteeUserId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "granted_by_user_id")
    private Long grantedByUserId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public TenantAccessGrant(Long granteeUserId, Long tenantId, Long grantedByUserId) {
        this.granteeUserId = granteeUserId;
        this.tenantId = tenantId;
        this.grantedByUserId = grantedByUserId;
        this.createdAt = LocalDateTime.now();
    }
}
