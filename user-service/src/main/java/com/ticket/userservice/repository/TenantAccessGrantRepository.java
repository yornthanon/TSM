package com.ticket.userservice.repository;

import com.ticket.userservice.entity.TenantAccessGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantAccessGrantRepository extends JpaRepository<TenantAccessGrant, Long> {
    @Query("select g.tenantId from TenantAccessGrant g where g.granteeUserId = :userId")
    List<Long> findTenantIdsByGranteeUserId(@Param("userId") Long userId);

    void deleteByGranteeUserIdAndTenantId(Long granteeUserId, Long tenantId);
}
