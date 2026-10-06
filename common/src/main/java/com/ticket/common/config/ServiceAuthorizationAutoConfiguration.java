package com.ticket.common.config;

import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.common.security.ServiceRoleAuthorizationFilter;
import com.ticket.common.security.TenantScopeSecurityFilter;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
public class ServiceAuthorizationAutoConfiguration {
    @Bean
    ServiceRoleAuthorizationFilter serviceRoleAuthorizationFilter(
            @Value("${jwt.secret:${JWT_SECRET:}}") String jwtSecret,
            InternalTokenProvider internalTokenProvider) {
        return new ServiceRoleAuthorizationFilter(jwtSecret, internalTokenProvider);
    }

    @Bean
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
    @ConditionalOnBean(EntityManager.class)
    TenantScopeSecurityFilter tenantScopeSecurityFilter(
            EntityManager entityManager,
            @Value("${jwt.secret:${JWT_SECRET:}}") String jwtSecret,
            InternalTokenProvider internalTokenProvider) {
        return new TenantScopeSecurityFilter(entityManager, jwtSecret, internalTokenProvider);
    }
}
