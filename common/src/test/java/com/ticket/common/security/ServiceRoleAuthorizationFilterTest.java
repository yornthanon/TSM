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
    void allowsRegularUsersToManageTenantEventsAndTicketsOnly() throws Exception {
        List<MockHttpServletRequest> allowedRequests = List.of(
                authenticated("POST", "/api/v1/events", "USER"),
                authenticated("PUT", "/api/v1/events/12", "USER"),
                authenticated("DELETE", "/api/v1/events/12", "USER"),
                authenticated("POST", "/api/v1/tickets", "USER"),
                authenticated("PUT", "/api/v1/tickets/34", "USER"),
                authenticated("DELETE", "/api/v1/tickets/34", "USER"));

        for (MockHttpServletRequest request : allowedRequests) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = mock(FilterChain.class);
            filter.doFilter(request, response, chain);
            assertThat(response.getStatus()).as("%s %s", request.getMethod(), request.getRequestURI()).isEqualTo(200);
            verify(chain).doFilter(request, response);
        }

        List<MockHttpServletRequest> deniedRequests = List.of(
                authenticated("PUT", "/api/v1/admin/events/12", "USER"),
                authenticated("PUT", "/api/v1/admin/orders/12/cancel", "USER"),
                authenticated("POST", "/api/v1/payments/12/refund", "USER"));

        for (MockHttpServletRequest request : deniedRequests) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = mock(FilterChain.class);
            filter.doFilter(request, response, chain);
            assertThat(response.getStatus()).as("%s %s", request.getMethod(), request.getRequestURI()).isEqualTo(403);
            verifyNoInteractions(chain);
        }
    }

    @Test
    void restrictsOrderCancellationToTenantAdmin() throws Exception {
        MockHttpServletRequest tenantRequest = authenticated("PUT", "/api/v1/orders/12/cancel", "TENANT_ADMIN");
        MockHttpServletResponse tenantResponse = new MockHttpServletResponse();
        FilterChain tenantChain = mock(FilterChain.class);
        filter.doFilter(tenantRequest, tenantResponse, tenantChain);
        assertThat(tenantResponse.getStatus()).isEqualTo(200);
        verify(tenantChain).doFilter(tenantRequest, tenantResponse);

        MockHttpServletRequest userRequest = authenticated("PUT", "/api/v1/orders/12/cancel", "USER");
        MockHttpServletResponse userResponse = new MockHttpServletResponse();
        FilterChain userChain = mock(FilterChain.class);
        filter.doFilter(userRequest, userResponse, userChain);
        assertThat(userResponse.getStatus()).isEqualTo(403);
        verifyNoInteractions(userChain);
    }

    @Test
    void allowsAllApplicationRolesToReadTenantDashboardData() throws Exception {
        List<String> dashboardRoles = List.of("USER", "TENANT_ADMIN", "ADMIN");
        List<String> dashboardPaths = List.of(
                "/api/v1/events/stats",
                "/api/v1/tickets/stats",
                "/api/v1/orders/stats",
                "/api/v1/payments",
                "/api/v1/payments/revenue-summary",
                "/api/v1/workspaces/current");

        for (String role : dashboardRoles) {
            for (String path : dashboardPaths) {
                MockHttpServletRequest request = authenticated("GET", path, role);
                MockHttpServletResponse response = new MockHttpServletResponse();
                FilterChain chain = mock(FilterChain.class);
                filter.doFilter(request, response, chain);
                assertThat(response.getStatus()).as("role=%s path=%s", role, path).isEqualTo(200);
                verify(chain).doFilter(request, response);
            }
        }
    }

    @Test
    void keepsPlatformNotificationStatsRestrictedToAdmin() throws Exception {
        for (String role : List.of("USER", "TENANT_ADMIN")) {
            MockHttpServletRequest request = authenticated("GET", "/api/v1/admin/notifications/stats", role);
            MockHttpServletResponse response = new MockHttpServletResponse();
            FilterChain chain = mock(FilterChain.class);
            filter.doFilter(request, response, chain);
            assertThat(response.getStatus()).as("role=%s", role).isEqualTo(403);
            verifyNoInteractions(chain);
        }

        MockHttpServletRequest adminRequest = authenticated("GET", "/api/v1/admin/notifications/stats", "ADMIN");
        MockHttpServletResponse adminResponse = new MockHttpServletResponse();
        FilterChain adminChain = mock(FilterChain.class);
        filter.doFilter(adminRequest, adminResponse, adminChain);
        assertThat(adminResponse.getStatus()).isEqualTo(200);
        verify(adminChain).doFilter(adminRequest, adminResponse);
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
