package com.ticket.apigateway.filter;

import com.ticket.apigateway.exception.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Slf4j
@Component
public class JwtAuthenticationFilter implements WebFilter, Ordered {

    private final ObjectMapper objectMapper;
    private final SecretKey secretKey;

    @Value("${jwt.header:Authorization}")
    private String jwtHeader;

    @Value("${jwt.prefix:Bearer}")
    private String jwtPrefix;

    @Value("${jwt.public-paths:/api/public/**,/health,/actuator/health,/actuator/info}")
    private String publicPaths;

    // Paths restricted to ADMIN role
    @Value("${jwt.admin-paths:/api/routes/**}")
    private String adminPaths;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JwtAuthenticationFilter(ObjectMapper objectMapper,
                                   @Value("${jwt.secret:}") String jwtSecret) {
        this.objectMapper = objectMapper;
        this.secretKey = parseSecretKey(jwtSecret);
    }

    private SecretKey parseSecretKey(String jwtSecret) {
        if (!StringUtils.hasText(jwtSecret)) {
            throw new IllegalStateException("jwt.secret must be configured for the gateway");
        }
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Skip authentication for public paths
        if (isPublicPath(path)) {
            log.debug("Skipping authentication for public path: {}", path);
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        String prefix = jwtPrefix + " ";

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(prefix)) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            return handleUnauthorized(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(prefix.length());

        if (!isValidToken(token)) {
            log.warn("Token verification failed for path: {}", path);
            return handleUnauthorized(exchange, "Invalid token");
        }

        // ADMIN-only paths (e.g. route management)
        if (isAdminPath(path) && !hasAdminRole(token)) {
            log.warn("Access denied: ADMIN role required for path: {}", path);
            return handleForbidden(exchange, "ADMIN role required");
        }

        log.debug("Token verification successful for path: {}", path);
        return chain.filter(exchange);
    }

    private boolean isPublicPath(String path) {
        return matchesAny(path, publicPaths);
    }

    private boolean isAdminPath(String path) {
        return matchesAny(path, adminPaths);
    }

    private boolean matchesAny(String path, String patterns) {
        return Arrays.stream(patterns.split(","))
                .map(String::trim)
                .filter(p -> !p.isEmpty())
                .anyMatch(p -> pathMatcher.match(p, path));
    }

    private boolean hasAdminRole(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Object roles = claims.get("roles");
            if (roles instanceof List<?> roleList) {
                return roleList.stream()
                        .map(String::valueOf)
                        .anyMatch("ADMIN"::equalsIgnoreCase);
            }
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isValidToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return StringUtils.hasText(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        return writeError(exchange, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }

    private Mono<Void> handleForbidden(ServerWebExchange exchange, String message) {
        return writeError(exchange, HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }

    private Mono<Void> writeError(ServerWebExchange exchange, HttpStatus status, String code, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ApiResponse<Object> errorResponse = ApiResponse.error(code, message);

        try {
            String errorJson = objectMapper.writeValueAsString(errorResponse);
            DataBuffer buffer = response.bufferFactory().wrap(errorJson.getBytes(StandardCharsets.UTF_8));
            return response.writeWith(Mono.just(buffer));
        } catch (Exception e) {
            log.error("Error creating error response: {}", e.getMessage());
            return response.setComplete();
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10; // Run after CorrelationIdFilter but before other filters
    }
}