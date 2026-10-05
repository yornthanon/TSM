package com.ticket.userservice.filter;

import com.ticket.common.tenant.TenantContextHolder;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.hibernate.Session;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Applies the authenticated workspace to Hibernate for the lifetime of a request. */
public class TenantScopeFilter extends OncePerRequestFilter {
    public static final String TENANT_HEADER = TenantContextHolder.TENANT_HEADER;
    private final EntityManager entityManager;
    private final TenantWorkspaceRepository workspaceRepository;
    private final CustomUserDetailService userDetailService;

    public TenantScopeFilter(EntityManager entityManager,
                             TenantWorkspaceRepository workspaceRepository,
                             CustomUserDetailService userDetailService) {
        this.entityManager = entityManager;
        this.workspaceRepository = workspaceRepository;
        this.userDetailService = userDetailService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || !hasAnyApplicationAuthority(authentication)) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean platformAdmin = hasAuthority(authentication, "ADMIN");
        boolean internalService = hasAuthority(authentication, "INTERNAL_SERVICE");
        Long tenantId;
        try {
            if (platformAdmin || internalService) {
                tenantId = readTrustedTenantHeader(request, platformAdmin);
            } else {
                Object principal = authentication.getPrincipal();
                CustomUserDetail user = principal instanceof CustomUserDetail details
                        ? details
                        : userDetailService.customUserDetail(authentication.getName());
                tenantId = user.getTenantId();
            }
        } catch (IllegalArgumentException exception) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid workspace context.");
            return;
        }

        if (!platformAdmin && tenantId == null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "This account is not assigned to a workspace.");
            return;
        }
        if (tenantId == null && internalService) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Internal requests must include a workspace context.");
            return;
        }
        if (!platformAdmin && !isWorkspaceActive(tenantId)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "This workspace is unavailable.");
            return;
        }

        TenantContextHolder.set(tenantId, platformAdmin);
        try {
            if (tenantId != null) {
                Session session = entityManager.unwrap(Session.class);
                session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
        }
    }

    private Long readTrustedTenantHeader(HttpServletRequest request, boolean platformAdmin) {
        String value = request.getHeader(TENANT_HEADER);
        if (!StringUtils.hasText(value)) return null;
        if (!platformAdmin && !hasAuthority(
                SecurityContextHolder.getContext().getAuthentication(), "INTERNAL_SERVICE")) {
            return null;
        }
        try {
            long tenantId = Long.parseLong(value.trim());
            if (tenantId <= 0) throw new NumberFormatException();
            return tenantId;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid workspace context.", exception);
        }
    }

    private boolean isWorkspaceActive(Long tenantId) {
        return tenantId != null && workspaceRepository.findById(tenantId)
                .map(workspace -> "ACTIVE".equalsIgnoreCase(workspace.getStatus()))
                .orElse(false);
    }

    private boolean hasAuthority(Authentication authentication, String expected) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(expected::equals);
    }

    private boolean hasAnyApplicationAuthority(Authentication authentication) {
        return hasAuthority(authentication, "USER")
                || hasAuthority(authentication, "TENANT_ADMIN")
                || hasAuthority(authentication, "ADMIN")
                || hasAuthority(authentication, "INTERNAL_SERVICE");
    }
}
