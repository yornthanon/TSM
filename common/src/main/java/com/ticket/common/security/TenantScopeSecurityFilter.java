package com.ticket.common.security;

import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.common.tenant.TenantContextHolder;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Collection;
import java.util.Set;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Base64;

/**
 * Applies the authenticated workspace to every servlet service.
 *
 * The gateway is not a security boundary: a service may be reachable directly
 * in a microservice deployment. Therefore each service validates the JWT (or
 * the internal service token), enables Hibernate's tenant filter, and rejects
 * an API request that has no authenticated workspace context.
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 15)
public final class TenantScopeSecurityFilter extends OncePerRequestFilter {
    private static final String BEARER_PREFIX = "Bearer ";
    private final EntityManager entityManager;
    private final String jwtSecret;
    private final InternalTokenProvider internalTokenProvider;

    public TenantScopeSecurityFilter(EntityManager entityManager,
                                     String jwtSecret,
                                     InternalTokenProvider internalTokenProvider) {
        this.entityManager = entityManager;
        this.jwtSecret = jwtSecret;
        this.internalTokenProvider = internalTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (isPublicPath(request.getRequestURI()) || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String internalToken = request.getHeader(internalTokenProvider.headerName());
        boolean internal = StringUtils.hasText(internalToken)
                && internalTokenProvider.getToken().equals(internalToken);
        Claims claims = null;
        if (!internal) {
            String authorization = request.getHeader("Authorization");
            if (!StringUtils.hasText(authorization) || !authorization.startsWith(BEARER_PREFIX)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required.");
                return;
            }
            try {
                claims = parseClaims(authorization.substring(BEARER_PREFIX.length()).trim());
            } catch (Exception ignored) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid authentication token.");
                return;
            }
        }

        boolean platformAdmin = internal || hasRole(claims, "ADMIN");
        Long tenantId;
        try {
            tenantId = platformAdmin
                    ? readTenantHeader(request)
                    : numberClaim(claims, "tenant_id");
        } catch (IllegalArgumentException exception) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid workspace context.");
            return;
        }
        if (!platformAdmin && tenantId == null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "This account is not assigned to a workspace.");
            return;
        }
        if (internal && tenantId == null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Internal requests must include a workspace context.");
            return;
        }

        Set<Long> allowedTenantIds = new LinkedHashSet<>();
        if (tenantId != null) allowedTenantIds.add(tenantId);
        if (!platformAdmin && claims != null) allowedTenantIds.addAll(numberClaims(claims, "tenant_ids"));
        if (!platformAdmin && allowedTenantIds.isEmpty()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "This account has no workspace access.");
            return;
        }
        TenantContextHolder.set(tenantId, platformAdmin && !internal);
        try {
            if (!allowedTenantIds.isEmpty()) {
                var tenantFilter = entityManager.unwrap(Session.class).enableFilter("tenantFilter");
                tenantFilter.setParameterList("tenantIds", allowedTenantIds);
                tenantFilter.setParameter("tenantId", allowedTenantIds.iterator().next());
            }
            chain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
        }
    }

    private Claims parseClaims(String token) {
        if (!StringUtils.hasText(jwtSecret)) throw new IllegalStateException("JWT secret is not configured.");
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        if (keyBytes.length < 32) throw new IllegalArgumentException("JWT secret is too short.");
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    private boolean hasRole(Claims claims, String expected) {
        if (claims == null) return false;
        return claimValues(claims.get("roles")).contains(expected)
                || claimValues(claims.get("authorities")).contains(expected);
    }

    private Set<String> claimValues(Object value) {
        Set<String> values = new HashSet<>();
        if (value instanceof Collection<?> collection) {
            collection.stream().filter(String.class::isInstance).map(String.class::cast).forEach(values::add);
        } else if (value instanceof String text) {
            values.add(text);
        }
        return values;
    }

    private Long numberClaim(Claims claims, String name) {
        if (claims == null) return null;
        Object value = claims.get(name);
        if (value instanceof Number number) return number.longValue();
        if (value instanceof String text) {
            try { return Long.parseLong(text); } catch (NumberFormatException ignored) { return null; }
        }
        return null;
    }
    private Set<Long> numberClaims(Claims claims, String name) {
        Set<Long> values = new LinkedHashSet<>();
        Object value = claims.get(name);
        if (value instanceof Collection<?> collection) {
            for (Object item : collection) {
                if (item instanceof Number number) values.add(number.longValue());
                else if (item instanceof String text) {
                    try { values.add(Long.parseLong(text)); } catch (NumberFormatException ignored) { }
                }
            }
        }
        return values;
    }

    private Long readTenantHeader(HttpServletRequest request) {
        String value = request.getHeader(TenantContextHolder.TENANT_HEADER);
        if (!StringUtils.hasText(value)) return null;
        try {
            long tenantId = Long.parseLong(value.trim());
            if (tenantId <= 0) throw new NumberFormatException();
            return tenantId;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid workspace context.", exception);
        }
    }

    private boolean isPublicPath(String path) {
        return path.equals("/health") || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")
                || path.startsWith("/webjars/") || path.startsWith("/api/public/")
                || path.startsWith("/api/v1/auth/") || path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/");
    }
}
