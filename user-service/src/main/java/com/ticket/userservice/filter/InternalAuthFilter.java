package com.ticket.userservice.filter;

import com.ticket.common.internal.InternalTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Trusts module-to-module calls, but does not grant global ADMIN authority.
 * TenantScopeFilter additionally requires a trusted workspace header.
 */
@RequiredArgsConstructor
public class InternalAuthFilter extends OncePerRequestFilter {

    private final InternalTokenProvider internalTokenProvider;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String headerValue = request.getHeader(internalTokenProvider.headerName());
        if (StringUtils.hasText(headerValue) && headerValue.equals(internalTokenProvider.getToken())) {
            Authentication existing = SecurityContextHolder.getContext().getAuthentication();
            if (existing == null || !existing.isAuthenticated() || existing instanceof AnonymousAuthenticationToken) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        "internal-service", null, List.of(new SimpleGrantedAuthority("INTERNAL_SERVICE")));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }
}
