package com.ticket.common.config;

import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.common.security.ServiceRoleAuthorizationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
public class ServiceAuthorizationAutoConfiguration {
    @Bean
    ServiceRoleAuthorizationFilter serviceRoleAuthorizationFilter(
            @Value("${jwt.secret:${JWT_SECRET:}}") String jwtSecret,
            InternalTokenProvider internalTokenProvider) {
        return new ServiceRoleAuthorizationFilter(jwtSecret, internalTokenProvider);
    }
}
