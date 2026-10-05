package com.ticket.userservice.repository;

import com.ticket.userservice.entity.TenantWorkspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TenantWorkspaceRepository extends JpaRepository<TenantWorkspace, Long> {
    List<TenantWorkspace> findAllByOrderByCreatedAtDesc();

    boolean existsByOwnerUserId(Long ownerUserId);
}
