package com.ticket.userservice.security;

import com.ticket.userservice.service.OAuthLoginCodeService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthLoginHandler implements AuthenticationSuccessHandler, AuthenticationFailureHandler {

    private final OAuthLoginCodeService loginCodeService;

    @Value("${app.oauth2.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException, ServletException {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof OAuth2User oauthUser)) {
            redirectError(request, response, "google_signin_failed");
            return;
        }

        Object emailClaim = oauthUser.getAttributes().get("email");
        Object verifiedClaim = oauthUser.getAttributes().get("email_verified");
        Object subjectClaim = oauthUser.getAttributes().get("sub");
        String email = emailClaim instanceof String value ? value : null;
        String googleSubject = subjectClaim instanceof String value ? value : null;
        boolean emailVerified = Boolean.TRUE.equals(verifiedClaim)
                || "true".equalsIgnoreCase(String.valueOf(verifiedClaim));
        if (!emailVerified || !StringUtils.hasText(email)
                || !StringUtils.hasText(googleSubject) || googleSubject.length() > 255) {
            redirectError(request, response, "account_not_linked");
            return;
        }

        try {
            String code = loginCodeService.issueForVerifiedGoogleIdentity(email, googleSubject);
            invalidateSession(request);
            response.setHeader("Cache-Control", "no-store, no-cache, max-age=0");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Referrer-Policy", "no-referrer");
            response.sendRedirect(frontendBase() + "/#/oauth/callback?code=" + code);
        } catch (RuntimeException exception) {
            // Do not log identity claims, authorization codes, or provider tokens.
            log.warn("Google sign-in could not be linked to an eligible TicketDesk account.");
            redirectError(request, response, "account_not_linked");
        }
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        log.warn("Google OAuth sign-in did not complete: {}", exception.getClass().getSimpleName());
        redirectError(request, response, "google_signin_failed");
    }

    private void redirectError(HttpServletRequest request, HttpServletResponse response, String code) throws IOException {
        invalidateSession(request);
        response.setHeader("Cache-Control", "no-store, no-cache, max-age=0");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.sendRedirect(frontendBase() + "/#/login?oauth_error=" + code);
    }

    private void invalidateSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }

    private String frontendBase() {
        String value = frontendUrl == null ? "http://localhost:5173" : frontendUrl.trim();
        while (value.endsWith("/")) value = value.substring(0, value.length() - 1);
        return value;
    }
}
