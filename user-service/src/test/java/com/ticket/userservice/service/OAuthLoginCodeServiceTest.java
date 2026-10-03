package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.OAuthCodeExchangeRequest;
import com.ticket.userservice.dto.response.OAuthCodeExchangeResponse;
import com.ticket.userservice.entity.OAuthLoginCode;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.OAuthLoginCodeRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuthLoginCodeServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private OAuthLoginCodeRepository codeRepository;
    @Mock private JwtService jwtService;
    @Mock private TotpMfaService mfaService;
    @Mock private CustomUserDetailService userDetailService;

    @InjectMocks private OAuthLoginCodeService service;

    @Test
    void issueStoresOnlyTheHashAndUsesAShortExpiry() {
        User user = activeUser();
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));

        String rawCode = service.issueForVerifiedGoogleEmail("owner@example.com");

        ArgumentCaptor<OAuthLoginCode> stored = ArgumentCaptor.forClass(OAuthLoginCode.class);
        verify(codeRepository).save(stored.capture());
        assertNotEquals(rawCode, stored.getValue().getCodeHash());
        assertEquals(64, stored.getValue().getCodeHash().length());
        assertEquals(user.getId(), stored.getValue().getUserId());
        assertTrue(Duration.between(stored.getValue().getCreatedAt(), stored.getValue().getExpiresAt()).toSeconds() <= 90);
        assertTrue(Duration.between(stored.getValue().getCreatedAt(), stored.getValue().getExpiresAt()).toSeconds() > 0);
    }

    @Test
    void exchangeIssuesTokensOnceAndRejectsReplay() throws Exception {
        User user = activeUser();
        String rawCode = "random-one-time-oauth-code";
        OAuthLoginCode stored = new OAuthLoginCode(hash(rawCode), user.getId(), Instant.now().plusSeconds(60), Instant.now());
        when(codeRepository.findByCodeHashForUpdate(hash(rawCode))).thenReturn(Optional.of(stored));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any())).thenReturn("access-token");
        when(jwtService.refreshToken(any())).thenReturn("refresh-token");

        ResponseErrorTemplate success = service.exchange(new OAuthCodeExchangeRequest(rawCode, null));

        assertFalse(success.isError());
        assertInstanceOf(OAuthCodeExchangeResponse.class, success.data());
        assertNotNull(stored.getConsumedAt());
        verify(jwtService, times(1)).generateToken(any());

        ResponseErrorTemplate replay = service.exchange(new OAuthCodeExchangeRequest(rawCode, null));
        assertTrue(replay.isError());
        assertEquals("OAUTH_CODE_INVALID", replay.code());
        verify(jwtService, times(1)).generateToken(any());
    }

    @Test
    void enrolledMfaRequiresATotpBeforeIssuingTokens() throws Exception {
        User user = activeUser();
        user.setMfaEnabled(true);
        String rawCode = "mfa-protected-one-time-code";
        OAuthLoginCode stored = new OAuthLoginCode(hash(rawCode), user.getId(), Instant.now().plusSeconds(60), Instant.now());
        when(codeRepository.findByCodeHashForUpdate(hash(rawCode))).thenReturn(Optional.of(stored));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        ResponseErrorTemplate response = service.exchange(new OAuthCodeExchangeRequest(rawCode, null));

        assertTrue(response.isError());
        assertEquals("MFA_REQUIRED", response.code());
        assertNull(stored.getConsumedAt());
        verify(userDetailService).saveUserAttemptAuthentication("owner");
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void unlinkedGoogleEmailCannotProvisionAnAccount() {
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
        assertThrows(IllegalStateException.class, () -> service.issueForVerifiedGoogleEmail("new@example.com"));
        verify(codeRepository, never()).save(any());
    }

    private User activeUser() {
        User user = new User();
        user.setId(14L);
        user.setUsername("owner");
        user.setEmail("owner@example.com");
        user.setPassword("encoded-password");
        user.setStatus("ACTIVE");
        user.setLoginAttempts(0);
        user.setMaxAttempts(5);
        return user;
    }

    private String hash(String value) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(digest);
    }
}
