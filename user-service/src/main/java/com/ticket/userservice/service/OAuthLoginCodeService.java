package com.ticket.userservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.OAuthCodeExchangeRequest;
import com.ticket.userservice.dto.response.OAuthCodeExchangeResponse;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.entity.OAuthLoginCode;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.TenantWorkspace;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.OAuthLoginCodeRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OAuthLoginCodeService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration CODE_TTL = Duration.ofSeconds(90);
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String TENANT_ADMIN_ROLE = "TENANT_ADMIN";
    private static final String USER_ROLE = "USER";
    private static final Long LEGACY_WORKSPACE_ID = 1L;

    private final UserRepository userRepository;
    private final OAuthLoginCodeRepository codeRepository;
    private final JwtService jwtService;
    private final TotpMfaService mfaService;
    private final CustomUserDetailService userDetailService;
    private final RoleRepository roleRepository;
    private final TenantWorkspaceRepository workspaceRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.platform-admin-emails:}")
    private String platformAdminEmails;

    /** Called only after Google's verified email and stable subject claims are checked by the success handler. */
    @Transactional
    public String issueForVerifiedGoogleIdentity(String email, String googleSubject) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(googleSubject)
                || googleSubject.trim().length() > 255) {
            throw new IllegalStateException("A verified Google identity is required.");
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        String stableGoogleSubject = googleSubject.trim();
        User user = userRepository.findByGoogleSubject(stableGoogleSubject).orElse(null);
        if (user != null) {
            User emailOwner = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
            if (emailOwner != null && !java.util.Objects.equals(emailOwner.getId(), user.getId())) {
                throw new IllegalStateException("This verified Google identity conflicts with an existing account.");
            }
        } else {
            user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
            if (user != null && StringUtils.hasText(user.getGoogleSubject())
                    && !stableGoogleSubject.equals(user.getGoogleSubject())) {
                throw new IllegalStateException("This email is already linked to another Google identity.");
            }
        }

        // The allowlisted email on an already-linked account is canonical. Google can
        // continue to return an old Gmail address after an email change; the stable
        // `sub` keeps that same account linked without allowlisting the old address.
        boolean configuredPlatformAdmin = isPlatformAdminEmail(normalizedEmail)
                || (user != null && isPlatformAdminEmail(user.getEmail()));

        if (user == null) {
            user = createGoogleAccount(normalizedEmail, stableGoogleSubject, configuredPlatformAdmin);
        } else {
            if (!StringUtils.hasText(user.getGoogleSubject())) {
                user.setGoogleSubject(stableGoogleSubject);
            }
            if (isPlatformAdminEmail(normalizedEmail)) {
                user.setEmail(normalizedEmail);
            } else if (!configuredPlatformAdmin && !normalizedEmail.equalsIgnoreCase(user.getEmail())) {
                user.setEmail(normalizedEmail);
            }
            boolean migratingLegacyAccount = !configuredPlatformAdmin
                    && user.getTenantId() != null
                    && LEGACY_WORKSPACE_ID.equals(user.getTenantId());
            if (migratingLegacyAccount && !isWorkspaceActive(user)) {
                throw new IllegalStateException("This Google account's legacy workspace is unavailable.");
            }
            reconcilePlatformRole(user, configuredPlatformAdmin);
            if (!configuredPlatformAdmin && (user.getTenantId() == null || migratingLegacyAccount)) {
                provisionWorkspace(user, normalizedEmail);
            }
            user = userRepository.saveAndFlush(user);
        }

        if (!isEligible(user) || !isWorkspaceActive(user)) {
            throw new IllegalStateException("This Google account is not eligible for TicketDesk sign-in.");
        }

        Instant now = Instant.now();
        codeRepository.deleteExpired(now);

        byte[] randomBytes = new byte[32];
        RANDOM.nextBytes(randomBytes);
        String rawCode = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        codeRepository.save(new OAuthLoginCode(hash(rawCode), user.getId(), now.plus(CODE_TTL), now));
        return rawCode;
    }

    @Transactional
    public ResponseErrorTemplate exchange(OAuthCodeExchangeRequest request) {
        String rawCode = request == null ? null : request.code();
        if (!StringUtils.hasText(rawCode) || rawCode.length() > 128) {
            return failure("This Google sign-in has expired. Start again.", "OAUTH_CODE_INVALID");
        }

        Instant now = Instant.now();
        OAuthLoginCode storedCode = codeRepository.findByCodeHashForUpdate(hash(rawCode.trim())).orElse(null);
        if (storedCode == null || storedCode.getConsumedAt() != null || !storedCode.getExpiresAt().isAfter(now)) {
            return failure("This Google sign-in has expired. Start again.", "OAUTH_CODE_INVALID");
        }

        User user = userRepository.findById(storedCode.getUserId()).orElse(null);
        if (user == null || !isEligible(user) || !isWorkspaceActive(user)) {
            consume(storedCode, now);
            return failure("Google sign-in is not enabled for this account. Contact your TicketDesk administrator.",
                    "GOOGLE_ACCOUNT_NOT_ALLOWED");
        }

        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            if (!StringUtils.hasText(request.totpCode())) {
                userDetailService.saveUserAttemptAuthentication(user.getUsername());
                return failure("Enter your authenticator code to finish signing in.", "MFA_REQUIRED");
            }
            if (!mfaService.verifyLoginCode(user.getUsername(), request.totpCode())) {
                userDetailService.saveUserAttemptAuthentication(user.getUsername());
                return failure("The authenticator code is invalid. Try the current 6-digit code.", "MFA_INVALID");
            }
        }

        userDetailService.updateAttempt(user.getUsername());
        consume(storedCode, now);
        CustomUserDetail principal = toPrincipal(user);
        OAuthCodeExchangeResponse tokens = new OAuthCodeExchangeResponse(
                jwtService.generateToken(principal),
                jwtService.refreshToken(principal),
                user.getUsername());
        return new ResponseErrorTemplate(ApiConstant.LOGIN_SUCCESS.getDescription(), ApiConstant.LOGIN_SUCCESS.getKey(), tokens, false);
    }

    private User createGoogleAccount(String email, String googleSubject, boolean platformAdmin) {
        User user = new User();
        user.setUsername(uniqueUsername(email));
        user.setEmail(email);
        user.setGoogleSubject(googleSubject);
        user.setFirstName(email.substring(0, email.indexOf('@')));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setStatus(ApiConstant.ACTIVE.getKey());
        user.setUserType("USER");
        user.setLoginAttempts(0);
        user.setMaxAttempts(5);
        user.setCreatedBy("GOOGLE_OAUTH");
        user.addRole(requiredRole(USER_ROLE));
        user.addRole(requiredRole(platformAdmin ? ADMIN_ROLE : TENANT_ADMIN_ROLE));

        TenantWorkspace workspace = null;
        if (!platformAdmin) {
            workspace = new TenantWorkspace();
            workspace.setName(workspaceName(email));
            workspace.setStatus("ACTIVE");
            workspace.setCreatedBy("GOOGLE_OAUTH");
            workspace = workspaceRepository.saveAndFlush(workspace);
            user.setTenantId(workspace.getId());
        }

        user = userRepository.saveAndFlush(user);
        if (workspace != null) {
            workspace.setOwnerUserId(user.getId());
            workspaceRepository.save(workspace);
        }
        return user;
    }

    private void provisionWorkspace(User user, String email) {
        TenantWorkspace workspace = new TenantWorkspace();
        workspace.setName(workspaceName(email));
        workspace.setStatus("ACTIVE");
        workspace.setCreatedBy("GOOGLE_OAUTH");
        workspace = workspaceRepository.saveAndFlush(workspace);
        user.setTenantId(workspace.getId());
        user.addRole(requiredRole(TENANT_ADMIN_ROLE));
        user.setCreatedBy(user.getCreatedBy() == null ? "GOOGLE_OAUTH" : user.getCreatedBy());
        userRepository.saveAndFlush(user);
        workspace.setOwnerUserId(user.getId());
        workspaceRepository.save(workspace);
    }

    private void reconcilePlatformRole(User user, boolean configuredPlatformAdmin) {
        if (configuredPlatformAdmin) {
            user.addRole(requiredRole(USER_ROLE));
            user.addRole(requiredRole(ADMIN_ROLE));
            return;
        }
        // Once an allowlist is configured, it becomes the sole source for global ADMIN.
        // Existing unlisted admins are demoted to their own workspace owner role.
        Set<Role> roles = user.getRoles();
        roles.removeIf(role -> ADMIN_ROLE.equals(role.getName()));
        user.addRole(requiredRole(USER_ROLE));
        if (user.getTenantId() != null) {
            user.addRole(requiredRole(TENANT_ADMIN_ROLE));
        }
    }

    private Role requiredRole(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new IllegalStateException("Required platform role is not initialized: " + name));
    }

    private boolean isPlatformAdminEmail(String email) {
        if (!StringUtils.hasText(platformAdminEmails)) return false;
        return List.of(platformAdminEmails.split(",")).stream()
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(email::equals);
    }

    private String uniqueUsername(String email) {
        String localPart = email.substring(0, email.indexOf('@'))
                .replaceAll("[^A-Za-z0-9._-]", "_");
        if (localPart.isBlank()) localPart = "google-user";
        String base = localPart.substring(0, Math.min(localPart.length(), 38));
        String candidate = base;
        while (userRepository.existsByUsername(candidate)) {
            String suffix = "-" + UUID.randomUUID().toString().substring(0, 8);
            candidate = base.substring(0, Math.min(base.length(), 50 - suffix.length())) + suffix;
        }
        return candidate;
    }

    private String workspaceName(String email) {
        String localPart = email.substring(0, email.indexOf('@'))
                .replaceAll("[._+-]+", " ")
                .trim();
        if (localPart.isBlank()) localPart = "My";
        return localPart.substring(0, Math.min(localPart.length(), 120)) + " TicketDesk";
    }

    private boolean isEligible(User user) {
        int attempts = user.getLoginAttempts() == null ? 0 : user.getLoginAttempts();
        int maximum = user.getMaxAttempts() == null ? 5 : user.getMaxAttempts();
        return ApiConstant.ACTIVE.getKey().equals(user.getStatus()) && attempts <= maximum;
    }

    private boolean isWorkspaceActive(User user) {
        if (user.getTenantId() == null) return isPlatformAdminEmail(user.getEmail());
        return workspaceRepository.findById(user.getTenantId())
                .map(workspace -> "ACTIVE".equalsIgnoreCase(workspace.getStatus()))
                .orElse(false);
    }

    private CustomUserDetail toPrincipal(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(Role::getName)
                .map(SimpleGrantedAuthority::new)
                .map(authority -> (GrantedAuthority) authority)
                .collect(Collectors.toList());
        return new CustomUserDetail(user.getUsername(), user.getPassword(), authorities, user.getTenantId());
    }

    private void consume(OAuthLoginCode code, Instant at) {
        code.setConsumedAt(at);
        codeRepository.save(code);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to process Google sign-in code.", exception);
        }
    }

    private ResponseErrorTemplate failure(String message, String code) {
        return new ResponseErrorTemplate(message, code, new EmptyObject(), true);
    }
}
