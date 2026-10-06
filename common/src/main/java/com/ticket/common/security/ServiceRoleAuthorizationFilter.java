package com.ticket.common.security;

import com.ticket.common.internal.InternalTokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Enforces the role contract at each backend service, not only at the gateway.
 * The filter is deliberately limited to administrative and mutating routes;
 * ordinary read routes continue through the service's existing authentication.
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public final class ServiceRoleAuthorizationFilter extends OncePerRequestFilter {
    private final String jwtSecret;
    private final InternalTokenProvider internalTokenProvider;

    public ServiceRoleAuthorizationFilter(String jwtSecret, InternalTokenProvider internalTokenProvider) {
        this.jwtSecret = jwtSecret;
        this.internalTokenProvider = internalTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if (path.startsWith("/api/") && path.contains("/internal/")) {
            if (isInternalTokenValid(request)) {
                chain.doFilter(request, response);
            } else {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Internal service authorization required.");
            }
            return;
        }

        String requiredRole = requiredRole(request.getMethod(), path);
        if (requiredRole == null) {
            chain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader("Authorization");
        if (!StringUtils.hasText(authorization) || !authorization.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required.");
            return;
        }
        if (!StringUtils.hasText(jwtSecret)) {
            response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "Backend authorization is not configured.");
            return;
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey())
                    .build()
                    .parseSignedClaims(authorization.substring("Bearer ".length()).trim())
                    .getPayload();
            Set<String> roles = roles(claims);
            boolean authorized = roles.contains(requiredRole)
                    || ("TENANT_ADMIN".equals(requiredRole) && roles.contains("ADMIN"));
            if (!authorized) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Insufficient role for this operation.");
                return;
            }
            chain.doFilter(request, response);
        } catch (Exception ignored) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid authentication token.");
        }
    }

    private boolean isInternalTokenValid(HttpServletRequest request) {
        String provided = request.getHeader(internalTokenProvider.headerName());
        return StringUtils.hasText(provided) && internalTokenProvider.getToken().equals(provided);
    }

    private SecretKey secretKey() {
        byte[] bytes = Base64.getDecoder().decode(jwtSecret);
        if (bytes.length < 32) {
            throw new IllegalArgumentException("JWT secret must decode to at least 32 bytes.");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    private Set<String> roles(Claims claims) {
        Set<String> result = new HashSet<>();
        addClaimRoles(result, claims.get("roles"));
        addClaimRoles(result, claims.get("authorities"));
        return result;
    }

    private void addClaimRoles(Set<String> roles, Object claim) {
        if (claim instanceof Collection<?> values) {
            values.stream().filter(String.class::isInstance).map(String.class::cast).forEach(roles::add);
        } else if (claim instanceof String value) {
            roles.add(value);
        }
    }

    private String requiredRole(String method, String path) {
        boolean mutating = List.of("POST", "PUT", "PATCH", "DELETE").contains(method.toUpperCase());
        if (path.startsWith("/api/v1/admin/events")) {
            return mutating ? "TENANT_ADMIN" : "ADMIN";
        }
        if (path.startsWith("/api/v1/admin/orders")) {
            return mutating ? "TENANT_ADMIN" : "ADMIN";
        }
        if (path.startsWith("/api/v1/admin/") || path.startsWith("/api/admin/")) {
            return "ADMIN";
        }
        if (path.startsWith("/api/v1/roles") || path.startsWith("/api/v1/groups")
                || path.startsWith("/api/v1/permissions")) {
            return "ADMIN";
        }
        if (path.startsWith("/api/v1/users") && !path.startsWith("/api/v1/users/me")) {
            return "ADMIN";
        }
        if (path.startsWith("/api/v1/events") || path.startsWith("/api/v1/tickets")) {
            return mutating ? "TENANT_ADMIN" : null;
        }
        if (path.matches("/api/v1/orders/[^/]+/(cancel|force-cancel)")
                || path.matches("/api/v1/payments/[^/]+/refund")) {
            return "TENANT_ADMIN";
        }
        return null;
    }
}
