package com.ticket.userservice.filter;

import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.config.properties.JwtConfigProperties;
import com.ticket.userservice.service.AdminActAsService;
import com.ticket.userservice.service.JwtService;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import com.ticket.userservice.utils.CustomMessageExceptionUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationInternalFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final JwtConfigProperties jwtConfigProperties;
    private final CustomUserDetailService userDetailService;
    private final AdminActAsService adminActAsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        var accessToken = request.getHeader(jwtConfigProperties.getHeader());
        if (!StringUtils.hasText(accessToken) || !accessToken.startsWith(jwtConfigProperties.getPrefix())) {
            filterChain.doFilter(request, response);
            return;
        }

        accessToken = accessToken.substring(jwtConfigProperties.getPrefix().length()).trim();
        AdminActAsService.ActAsContext actAsContext = null;
        try {
            if (jwtService.isValidToken(accessToken)) {
                Claims claims = jwtService.extractClaims(accessToken);
                String username = claims.getSubject();
                if (Boolean.TRUE.equals(claims.get("act_as", Boolean.class))) {
                    Long sessionId = numberClaim(claims, "act_as_session_id");
                    Long actorId = numberClaim(claims, "act_as_actor_id");
                    if (sessionId == null || actorId == null || !StringUtils.hasText(username)) {
                        throw new IllegalArgumentException("Invalid act-as token.");
                    }
                    actAsContext = adminActAsService.validate(sessionId, actorId, username);
                }
                if (StringUtils.hasText(username)) {
                    var userDetails = userDetailService.customUserDetail(username);
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
        } catch (Exception ex) {
            log.warn("Bearer token rejected ({})", ex.getClass().getSimpleName());
            var messageException = CustomMessageExceptionUtils.unauthorized();
            var msgJson = objectMapper.writeValueAsString(messageException);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(msgJson);
            return;
        }

        if (actAsContext != null && isRefundRequest(request)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(new ResponseErrorTemplate(
                    "Payment refunds are disabled during an act-as session.", "403", new EmptyObject(), true)));
            return;
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            if (actAsContext != null && !"OPTIONS".equalsIgnoreCase(request.getMethod())) {
                try {
                    adminActAsService.recordRequest(actAsContext, request.getMethod(), request.getRequestURI(), response.getStatus());
                } catch (Exception auditError) {
                    log.error("Act-as audit write failed ({})", auditError.getClass().getSimpleName());
                }
            }
        }
    }

    private Long numberClaim(Claims claims, String name) {
        Object value = claims.get(name);
        if (value instanceof Number number) return number.longValue();
        if (value instanceof String text) {
            try { return Long.parseLong(text); } catch (NumberFormatException ignored) { return null; }
        }
        return null;
    }

    private boolean isRefundRequest(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && request.getRequestURI().matches("/api/v1/payments/[^/]+/refund");
    }
}
