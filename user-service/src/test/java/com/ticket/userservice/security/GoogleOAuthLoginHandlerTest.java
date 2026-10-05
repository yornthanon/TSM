package com.ticket.userservice.security;

import com.ticket.userservice.service.OAuthLoginCodeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleOAuthLoginHandlerTest {

    @Mock private OAuthLoginCodeService loginCodeService;
    @Mock private Authentication authentication;
    @Mock private OAuth2User oauthUser;

    @Test
    void forwardsTheVerifiedGoogleEmailAndStableSubjectClaimsExactly() throws Exception {
        String googleEmail = "yornthano@gmail.com";
        String googleSubject = "google-subject-123";
        GoogleOAuthLoginHandler handler = new GoogleOAuthLoginHandler(loginCodeService);
        ReflectionTestUtils.setField(handler, "frontendUrl", "https://ticketdesk.example");
        when(authentication.getPrincipal()).thenReturn(oauthUser);
        when(oauthUser.getAttributes()).thenReturn(Map.of(
                "email", googleEmail,
                "email_verified", true,
                "sub", googleSubject));
        when(loginCodeService.issueForVerifiedGoogleIdentity(googleEmail, googleSubject)).thenReturn("one-time-code");

        MockHttpServletResponse response = new MockHttpServletResponse();
        handler.onAuthenticationSuccess(new MockHttpServletRequest(), response, authentication);

        verify(loginCodeService).issueForVerifiedGoogleIdentity(googleEmail, googleSubject);
        assertEquals("https://ticketdesk.example/#/oauth/callback?code=one-time-code", response.getRedirectedUrl());
    }

    @Test
    void rejectsVerifiedEmailWithoutGoogleSubject() throws Exception {
        GoogleOAuthLoginHandler handler = new GoogleOAuthLoginHandler(loginCodeService);
        ReflectionTestUtils.setField(handler, "frontendUrl", "https://ticketdesk.example");
        when(authentication.getPrincipal()).thenReturn(oauthUser);
        when(oauthUser.getAttributes()).thenReturn(Map.of(
                "email", "yornthanon.dev@gmail.com",
                "email_verified", true));

        MockHttpServletResponse response = new MockHttpServletResponse();
        handler.onAuthenticationSuccess(new MockHttpServletRequest(), response, authentication);

        verifyNoInteractions(loginCodeService);
        assertEquals("https://ticketdesk.example/#/login?oauth_error=account_not_linked", response.getRedirectedUrl());
    }
}
