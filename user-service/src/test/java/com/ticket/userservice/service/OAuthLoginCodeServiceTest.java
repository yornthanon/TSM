package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.OAuthCodeExchangeRequest;
import com.ticket.userservice.dto.response.OAuthCodeExchangeResponse;
import com.ticket.userservice.entity.OAuthLoginCode;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.TenantWorkspace;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.OAuthLoginCodeRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuthLoginCodeServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private OAuthLoginCodeRepository codeRepository;
    @Mock private JwtService jwtService;
    @Mock private TotpMfaService mfaService;
    @Mock private CustomUserDetailService userDetailService;
    @Mock private RoleRepository roleRepository;
    @Mock private TenantWorkspaceRepository workspaceRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private OAuthLoginCodeService service;

    @Test
    void existingUnassignedAccountGetsItsOwnWorkspaceAndCodeUsesAShortExpiryHash() {
        User user = activeUser();
        user.setTenantId(null);
        when(userRepository.findByEmailIgnoreCase("owner@example.com")).thenReturn(Optional.of(user));
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role("USER")));
        when(roleRepository.findByName("TENANT_ADMIN")).thenReturn(Optional.of(role("TENANT_ADMIN")));
        when(workspaceRepository.findById(29L)).thenReturn(Optional.of(activeWorkspace(29L)));
        when(workspaceRepository.saveAndFlush(any(TenantWorkspace.class))).thenAnswer(invocation -> {
            TenantWorkspace workspace = invocation.getArgument(0);
            workspace.setId(29L);
            return workspace;
        });
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String rawCode = service.issueForVerifiedGoogleIdentity("owner@example.com", "google-sub-owner");

        ArgumentCaptor<OAuthLoginCode> stored = ArgumentCaptor.forClass(OAuthLoginCode.class);
        verify(codeRepository).save(stored.capture());
        assertNotEquals(rawCode, stored.getValue().getCodeHash());
        assertEquals(64, stored.getValue().getCodeHash().length());
        assertEquals(user.getId(), stored.getValue().getUserId());
        assertEquals(29L, user.getTenantId());
        verify(workspaceRepository).save(any(TenantWorkspace.class));
        assertTrue(Duration.between(stored.getValue().getCreatedAt(), stored.getValue().getExpiresAt()).toSeconds() <= 90);
        assertTrue(Duration.between(stored.getValue().getCreatedAt(), stored.getValue().getExpiresAt()).toSeconds() > 0);
        assertTrue(user.getRoles().stream().anyMatch(role -> "TENANT_ADMIN".equals(role.getName())));
    }

    @Test
    void newVerifiedGoogleAccountGetsItsOwnWorkspaceAndOwnerRole() {
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("random-encoded-password");
        when(workspaceRepository.findById(29L)).thenReturn(Optional.of(activeWorkspace(29L)));
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role("USER")));
        when(roleRepository.findByName("TENANT_ADMIN")).thenReturn(Optional.of(role("TENANT_ADMIN")));
        when(workspaceRepository.saveAndFlush(any(TenantWorkspace.class))).thenAnswer(invocation -> {
            TenantWorkspace workspace = invocation.getArgument(0);
            workspace.setId(29L);
            return workspace;
        });
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            if (user.getId() == null) user.setId(61L);
            return user;
        });

        String rawCode = service.issueForVerifiedGoogleIdentity("new@example.com", "google-sub-new");

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(savedUser.capture());
        assertEquals("new@example.com", savedUser.getValue().getEmail());
        assertEquals("google-sub-new", savedUser.getValue().getGoogleSubject());
        assertEquals(29L, savedUser.getValue().getTenantId());
        assertTrue(savedUser.getValue().getRoles().stream().anyMatch(role -> "USER".equals(role.getName())));
        assertTrue(savedUser.getValue().getRoles().stream().anyMatch(role -> "TENANT_ADMIN".equals(role.getName())));
        ArgumentCaptor<TenantWorkspace> savedWorkspace = ArgumentCaptor.forClass(TenantWorkspace.class);
        verify(workspaceRepository).saveAndFlush(savedWorkspace.capture());
        verify(workspaceRepository).save(savedWorkspace.capture());
        assertEquals(61L, savedWorkspace.getAllValues().get(1).getOwnerUserId());
        ArgumentCaptor<OAuthLoginCode> savedCode = ArgumentCaptor.forClass(OAuthLoginCode.class);
        verify(codeRepository).save(savedCode.capture());
        assertNotEquals(rawCode, savedCode.getValue().getCodeHash());
    }

    @Test
    void similarButNotIdenticalGoogleEmailIsDemotedAndProvisionedIntoItsOwnWorkspace() {
        ReflectionTestUtils.setField(service, "platformAdminEmails", "yornthanon.dev@gmail.com");
        User user = activeUser();
        user.setEmail("yornthano@gmail.com");
        user.setTenantId(null);
        user.addRole(role("ADMIN"));
        when(userRepository.findByEmailIgnoreCase("yornthano@gmail.com")).thenReturn(Optional.of(user));
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role("USER")));
        when(roleRepository.findByName("TENANT_ADMIN")).thenReturn(Optional.of(role("TENANT_ADMIN")));
        when(workspaceRepository.saveAndFlush(any(TenantWorkspace.class))).thenAnswer(invocation -> {
            TenantWorkspace workspace = invocation.getArgument(0);
            workspace.setId(29L);
            return workspace;
        });
        when(workspaceRepository.findById(29L)).thenReturn(Optional.of(activeWorkspace(29L)));
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.issueForVerifiedGoogleIdentity("  yornthano@gmail.com  ", "google-sub-alias");

        assertEquals("yornthano@gmail.com", user.getEmail());
        assertEquals(29L, user.getTenantId());
        assertEquals("google-sub-alias", user.getGoogleSubject());
        assertTrue(user.getRoles().stream().anyMatch(role -> "USER".equals(role.getName())));
        assertTrue(user.getRoles().stream().anyMatch(role -> "TENANT_ADMIN".equals(role.getName())));
        assertFalse(user.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName())));
        verify(workspaceRepository).saveAndFlush(any(TenantWorkspace.class));
    }

    @Test
    void stableGoogleSubjectKeepsCanonicalCeoWhenGoogleReturnsItsOldEmail() {
        ReflectionTestUtils.setField(service, "platformAdminEmails", "yornthanon.dev@gmail.com");
        String googleSubject = "stable-google-subject";
        User user = activeUser();
        user.setEmail("yornthanon.dev@gmail.com");
        user.setTenantId(null);
        user.setGoogleSubject(googleSubject);
        user.addRole(role("USER"));
        user.addRole(role("TENANT_ADMIN"));
        when(userRepository.findByGoogleSubject(googleSubject)).thenReturn(Optional.of(user));
        when(userRepository.findByEmailIgnoreCase("yornthano@gmail.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role("USER")));
        when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(role("ADMIN")));
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.issueForVerifiedGoogleIdentity("yornthano@gmail.com", googleSubject);

        assertEquals("yornthanon.dev@gmail.com", user.getEmail());
        assertEquals(googleSubject, user.getGoogleSubject());
        assertTrue(user.getRoles().stream().anyMatch(role -> "ADMIN".equals(role.getName())));
        assertTrue(user.getRoles().stream().anyMatch(role -> "TENANT_ADMIN".equals(role.getName())));
        verify(workspaceRepository, never()).saveAndFlush(any(TenantWorkspace.class));
    }

    @Test
    void differentGoogleSubjectCannotTakeOverAnEmailAlreadyLinkedToAnotherSubject() {
        User user = activeUser();
        user.setEmail("yornthano@gmail.com");
        user.setGoogleSubject("already-linked-subject");
        when(userRepository.findByGoogleSubject("attacker-subject")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("yornthano@gmail.com")).thenReturn(Optional.of(user));

        assertThrows(IllegalStateException.class,
                () -> service.issueForVerifiedGoogleIdentity("yornthano@gmail.com", "attacker-subject"));
        verify(codeRepository, never()).save(any(OAuthLoginCode.class));
    }

    @Test
    void exchangeIssuesTokensOnceAndRejectsReplay() throws Exception {
        User user = activeUser();
        String rawCode = "random-one-time-oauth-code";
        OAuthLoginCode stored = new OAuthLoginCode(hash(rawCode), user.getId(), Instant.now().plusSeconds(60), Instant.now());
        when(codeRepository.findByCodeHashForUpdate(hash(rawCode))).thenReturn(Optional.of(stored));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(workspaceRepository.findById(1L)).thenReturn(Optional.of(activeWorkspace(1L)));
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
    void suspendedWorkspaceCannotExchangeGoogleCode() throws Exception {
        User user = activeUser();
        String rawCode = "suspended-workspace-code";
        OAuthLoginCode stored = new OAuthLoginCode(hash(rawCode), user.getId(), Instant.now().plusSeconds(60), Instant.now());
        when(codeRepository.findByCodeHashForUpdate(hash(rawCode))).thenReturn(Optional.of(stored));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        TenantWorkspace suspended = activeWorkspace(1L);
        suspended.setStatus("SUSPENDED");
        when(workspaceRepository.findById(1L)).thenReturn(Optional.of(suspended));

        ResponseErrorTemplate response = service.exchange(new OAuthCodeExchangeRequest(rawCode, null));

        assertTrue(response.isError());
        assertEquals("GOOGLE_ACCOUNT_NOT_ALLOWED", response.code());
        assertNotNull(stored.getConsumedAt());
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void enrolledMfaRequiresATotpBeforeIssuingTokens() throws Exception {
        User user = activeUser();
        user.setMfaEnabled(true);
        String rawCode = "mfa-protected-one-time-code";
        OAuthLoginCode stored = new OAuthLoginCode(hash(rawCode), user.getId(), Instant.now().plusSeconds(60), Instant.now());
        when(codeRepository.findByCodeHashForUpdate(hash(rawCode))).thenReturn(Optional.of(stored));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(workspaceRepository.findById(1L)).thenReturn(Optional.of(activeWorkspace(1L)));

        ResponseErrorTemplate response = service.exchange(new OAuthCodeExchangeRequest(rawCode, null));

        assertTrue(response.isError());
        assertEquals("MFA_REQUIRED", response.code());
        assertNull(stored.getConsumedAt());
        verify(userDetailService).saveUserAttemptAuthentication("owner");
        verify(jwtService, never()).generateToken(any());
    }

    private User activeUser() {
        User user = new User();
        user.setId(14L);
        user.setUsername("owner");
        user.setEmail("owner@example.com");
        user.setPassword("encoded-password");
        user.setStatus("ACTIVE");
        user.setTenantId(1L);
        user.setLoginAttempts(0);
        user.setMaxAttempts(5);
        return user;
    }

    private Role role(String name) {
        Role role = new Role();
        role.setName(name);
        return role;
    }

    private TenantWorkspace activeWorkspace(Long id) {
        TenantWorkspace workspace = new TenantWorkspace();
        workspace.setId(id);
        workspace.setStatus("ACTIVE");
        return workspace;
    }

    private String hash(String value) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(digest);
    }
}
