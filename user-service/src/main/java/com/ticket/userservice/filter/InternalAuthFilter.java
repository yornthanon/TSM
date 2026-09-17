package com.ticket.userservice.filter;

import com.ticket.common.internal.InternalTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Trusts requests that carry the shared internal token header (used only for
 * module-to-module calls inside the monolith). Sets full ADMIN authority so
 * internal HTTP calls pass the security filter chain without a JWT.
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
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    "system", null, List.of(new SimpleGrantedAuthority("ADMIN")));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}