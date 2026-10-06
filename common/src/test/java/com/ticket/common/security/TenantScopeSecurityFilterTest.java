package com.ticket.common.security;

import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.common.tenant.TenantContextHolder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class TenantScopeSecurityFilterTest {
    private static final String SECRET = Base64.getEncoder().encodeToString(
            "tenant-isolation-test-secret-with-32-bytes".getBytes(StandardCharsets.UTF_8));

    private EntityManager entityManager;
    private Session session;
    private Filter tenantFilter;
    private InternalTokenProvider internalTokenProvider;
    private TenantScopeSecurityFilter filter;

    @BeforeEach
    void setUp() {
        entityManager = mock(EntityManager.class);
        session = mock(Session.class);
        tenantFilter = mock(Filter.class);
        internalTokenProvider = new InternalTokenProvider("internal-test-token");
        filter = new TenantScopeSecurityFilter(entityManager, SECRET, internalTokenProvider);
        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.enableFilter("tenantFilter")).thenReturn(tenantFilter);
        when(tenantFilter.setParameter(anyString(), anyLong())).thenReturn(tenantFilter);
    }

    @AfterEach
    void clearTenantContext() {
        TenantContextHolder.clear();
    }

    @Test
    void userTokenScopesQueriesToItsOwnTenantAndIgnoresSpoofedHeader() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/events");
        request.addHeader("Authorization", "Bearer " + token("USER", 42L));
        request.addHeader(TenantScopeSecurityFilterTestHeader.TENANT, "99");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> {
            assertThat(TenantContextHolder.getTenantId()).isEqualTo(42L);
            assertThat(TenantContextHolder.isPlatformAdmin()).isFalse();
        };

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(tenantFilter).setParameter("tenantId", 42L);
        assertThat(TenantContextHolder.isSet()).isFalse();
    }

    @Test
    void userWithoutTenantIsRejectedBeforeTheControllerRuns() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/events");
        request.addHeader("Authorization", "Bearer " + token("USER", null));
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        verifyNoInteractions(chain, entityManager);
    }

    @Test
    void platformAdminGetsGlobalVisibilityOnlyWhenNoWorkspaceIsSelected() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/events");
        request.addHeader("Authorization", "Bearer " + token("ADMIN", null));
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> {
            assertThat(TenantContextHolder.getTenantId()).isNull();
            assertThat(TenantContextHolder.isPlatformAdmin()).isTrue();
        };

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        verifyNoInteractions(entityManager);
    }

    @Test
    void platformAdminCanSelectOneWorkspaceForAnAuditedScopedRequest() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/events");
        request.addHeader("Authorization", "Bearer " + token("ADMIN", null));
        request.addHeader("X-Tenant-Id", "77");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> {
            assertThat(TenantContextHolder.getTenantId()).isEqualTo(77L);
            assertThat(TenantContextHolder.isPlatformAdmin()).isTrue();
        };

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(tenantFilter).setParameter("tenantId", 77L);
    }

    @Test
    void internalRequestMustCarryWorkspaceContext() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/events");
        request.addHeader(internalTokenProvider.headerName(), internalTokenProvider.getToken());
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(403);
        verifyNoInteractions(chain, entityManager);
    }

    @Test
    void internalRequestUsesTrustedWorkspaceHeader() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/events");
        request.addHeader(internalTokenProvider.headerName(), internalTokenProvider.getToken());
        request.addHeader("X-Tenant-Id", "88");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> {
            assertThat(TenantContextHolder.getTenantId()).isEqualTo(88L);
            assertThat(TenantContextHolder.isPlatformAdmin()).isFalse();
        };

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(tenantFilter).setParameter("tenantId", 88L);
    }

    @Test
    void protectedApiWithoutCredentialsIsRejected() throws Exception {
        MockHttpServletRequest request = request("GET", "/api/v1/events");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        verifyNoInteractions(chain, entityManager);
    }

    @Test
    void publicHealthEndpointDoesNotNeedTenantContext() throws Exception {
        MockHttpServletRequest request = request("GET", "/actuator/health");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verifyNoInteractions(entityManager);
    }

    private MockHttpServletRequest request(String method, String path) {
        return new MockHttpServletRequest(method, path);
    }

    private String token(String role, Long tenantId) {
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));
        var builder = Jwts.builder()
                .subject("user@example.com")
                .claim("roles", List.of(role))
                .claim("authorities", List.of(role))
                .issuedAt(new Date());
        if (tenantId != null) builder.claim("tenant_id", tenantId);
        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    /** Avoid duplicating the production constant in the assertion setup. */
    private static final class TenantScopeSecurityFilterTestHeader {
        private static final String TENANT = "X-Tenant-Id";
    }
}
