package com.ticket.userservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.OAuthCodeExchangeRequest;
import com.ticket.userservice.dto.response.OAuthCodeExchangeResponse;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.entity.OAuthLoginCode;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.OAuthLoginCodeRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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

@Service
@RequiredArgsConstructor
public class OAuthLoginCodeService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration CODE_TTL = Duration.ofSeconds(90);

    private final UserRepository userRepository;
    private final OAuthLoginCodeRepository codeRepository;
    private final JwtService jwtService;
    private final TotpMfaService mfaService;
    private final CustomUserDetailService userDetailService;

    /** Called only after Google's verified-email claim has been checked by the success handler. */
    @Transactional
    public String issueForVerifiedGoogleEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalStateException("Google account is not eligible for TicketDesk sign-in.");
        }

        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .filter(this::isEligible)
                .orElseThrow(() -> new IllegalStateException("Google account is not eligible for TicketDesk sign-in."));

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
        if (user == null || !isEligible(user)) {
            consume(storedCode, now);
            return failure("Google sign-in is not enabled for this account. Contact your administrator.", "GOOGLE_ACCOUNT_NOT_ALLOWED");
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

    private boolean isEligible(User user) {
        int attempts = user.getLoginAttempts() == null ? 0 : user.getLoginAttempts();
        int maximum = user.getMaxAttempts() == null ? 5 : user.getMaxAttempts();
        return ApiConstant.ACTIVE.getKey().equals(user.getStatus()) && attempts <= maximum;
    }

    private CustomUserDetail toPrincipal(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(Role::getName)
                .map(SimpleGrantedAuthority::new)
                .map(authority -> (GrantedAuthority) authority)
                .toList();
        return new CustomUserDetail(user.getUsername(), user.getPassword(), authorities);
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
