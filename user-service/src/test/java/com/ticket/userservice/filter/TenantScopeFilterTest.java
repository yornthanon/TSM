package com.ticket.userservice.filter;

import com.ticket.common.tenant.TenantContextHolder;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.entity.TenantWorkspace;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantScopeFilterTest {

    @Mock private EntityManager entityManager;
    @Mock private TenantWorkspaceRepository workspaceRepository;
    @Mock private CustomUserDetailService userDetailService;
    @Mock private Session session;
    @Mock private Filter tenantFilter;

    private TenantScopeFilter tenantScopeFilter;

    @BeforeEach
    void setUp() {
        tenantScopeFilter = new TenantScopeFilter(entityManager, workspaceRepository, userDetailService);
    }

    @AfterEach
    void clearSecurityAndTenantContexts() {
        SecurityContextHolder.clearContext();
        TenantContextHolder.clear();
    }

    @Test
    void regularUserQueriesAreScopedToItsAuthenticatedWorkspace() throws Exception {
        CustomUserDetail principal = new CustomUserDetail("member", "ignored",
                List.of(new SimpleGrantedAuthority("USER")), 29L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
        TenantWorkspace workspace = new TenantWorkspace();
        workspace.setId(29L);
        workspace.setStatus("ACTIVE");
        when(workspaceRepository.findById(29L)).thenReturn(Optional.of(workspace));
        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.enableFilter("tenantFilter")).thenReturn(tenantFilter);
        when(tenantFilter.setParameter("tenantId", 29L)).thenReturn(tenantFilter);

        FilterChain chain = (request, response) -> {
            assertEquals(29L, TenantContextHolder.getTenantId());
            assertFalse(TenantContextHolder.isPlatformAdmin());
        };
        tenantScopeFilter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        verify(session).enableFilter("tenantFilter");
        verify(tenantFilter).setParameter("tenantId", 29L);
        assertFalse(TenantContextHolder.isSet());
    }

    @Test
    void platformAdminUsesGlobalScopeAndRequestContextIsStillCleared() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ceo", null,
                        List.of(new SimpleGrantedAuthority("ADMIN"))));

        FilterChain chain = (request, response) -> {
            assertNull(TenantContextHolder.getTenantId());
            assertTrue(TenantContextHolder.isPlatformAdmin());
        };
        tenantScopeFilter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), chain);

        verify(session, never()).enableFilter("tenantFilter");
        verify(workspaceRepository, never()).findById(anyLong());
        assertFalse(TenantContextHolder.isSet());
    }
}
