package com.ticket.eventservice.entity;

import com.ticket.common.entity.TenantScopedEntity;
import jakarta.persistence.MappedSuperclass;
import org.hibernate.annotations.Filter;

@MappedSuperclass
@Filter(name = "tenantFilter", condition = "tenant_id in (:tenantIds)")
public abstract class BaseEntity extends TenantScopedEntity {
}
