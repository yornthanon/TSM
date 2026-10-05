package com.ticket.common.security;

import com.ticket.common.internal.InternalTokenProvider;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class ServiceRoleAuthorizationFilterTest {
    private static final String SECRET = Base64.getEncoder().encodeToString(
            "test-secret-with-at-least-32-bytes-for-jwt".getBytes(StandardCharsets.UTF_8));
    private InternalTokenProvider internalTokenProvider;
    private ServiceRoleAuthorizationFilter filter;

    @BeforeEach
    void setUp() {
        internalTokenProvider = new InternalTokenProvider("internal-test-token");
        filter = new ServiceRoleAuthorizationFilter(SECRET, internalTokenProvider);
    }

    @Test
    void rejectsAdminRouteWithoutAuthentication() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/admin/users");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        verifyNoInteractions(chain);
    }

    @Test
    void rejectsAdminRouteWhenTokenHasOnlyTenantAdminRole() throws Exception {
        MockHttpServletRequest request = authenticated("GET", "/api/v1/admin/users", "TENANT_ADMIN");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        verifyNoInteractions(chain);
    }

    @Test
    void acceptsAdminRouteForPlatformAdminOnly() throws Exception {
        MockHttpServletRequest request = authenticated("GET", "/api/v1/admin/users", "ADMIN");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(chain).doFilter(request, response);
    }

    @Test
    void acceptsTenantAdminForEventMutationButRejectsRegularUser() throws Exception {
        MockHttpServletRequest tenantRequest = authenticated("PUT", "/api/v1/admin/events/12", "TENANT_ADMIN");
        MockHttpServletResponse tenantResponse = new MockHttpServletResponse();
        FilterChain tenantChain = mock(FilterChain.class);
        filter.doFilter(tenantRequest, tenantResponse, tenantChain);
        assertThat(tenantResponse.getStatus()).isEqualTo(200);
        verify(tenantChain).doFilter(tenantRequest, tenantResponse);

        MockHttpServletRequest platformRequest = authenticated("PUT", "/api/v1/admin/events/12", "ADMIN");
        MockHttpServletResponse platformResponse = new MockHttpServletResponse();
        FilterChain platformChain = mock(FilterChain.class);
        filter.doFilter(platformRequest, platformResponse, platformChain);
        assertThat(platformResponse.getStatus()).isEqualTo(200);
        verify(platformChain).doFilter(platformRequest, platformResponse);

        MockHttpServletRequest userRequest = authenticated("PUT", "/api/v1/admin/events/12", "USER");
        MockHttpServletResponse userResponse = new MockHttpServletResponse();
        FilterChain userChain = mock(FilterChain.class);
        filter.doFilter(userRequest, userResponse, userChain);
        assertThat(userResponse.getStatus()).isEqualTo(403);
        verifyNoInteractions(userChain);
    }

    @Test
    void requiresInternalTokenForInternalRoutes() throws Exception {
        MockHttpServletRequest request = request("POST", "/api/v1/tickets/internal/12/reserve");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        verifyNoInteractions(chain);

        request.addHeader(internalTokenProvider.headerName(), internalTokenProvider.getToken());
        response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        assertThat(response.getStatus()).isEqualTo(200);
        verify(chain).doFilter(request, response);
    }

    @Test
    void rejectsInvalidJwtSignature() throws Exception {
        SecretKey otherKey = Keys.hmacShaKeyFor(
                "different-secret-with-at-least-32-bytes-for-jwt".getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder().subject("admin@example.com")
                .claim("roles", List.of("ADMIN"))
                .issuedAt(new Date()).signWith(otherKey, SignatureAlgorithm.HS256).compact();
        MockHttpServletRequest request = request("GET", "/api/admin/payments");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        verifyNoInteractions(chain);
    }

    private MockHttpServletRequest authenticated(String method, String path, String role) {
        MockHttpServletRequest request = request(method, path);
        request.addHeader("Authorization", "Bearer " + token(role));
        return request;
    }

    private String token(String role) {
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));
        return Jwts.builder().subject("tester")
                .claim("roles", List.of(role))
                .claim("authorities", List.of(role))
                .issuedAt(new Date()).signWith(key, SignatureAlgorithm.HS256).compact();
    }

    private MockHttpServletRequest request(String method, String path) {
        return new MockHttpServletRequest(method, path);
    }
}
