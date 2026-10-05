package com.ticket.userservice.service.handle;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.CustomMessageException;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    @Value("${app.auth.platform-admin-emails:}")
    private String platformAdminEmails;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return this.customUserDetail(username);

    }

    public CustomUserDetail customUserDetail(String username) {
        // Load user regardless of status to give correct error for blocked users.
        // Accepts either the username or the email address as the login identifier.
        User user = userRepository.findByUsername(username);
        if (user == null) {
            user = userRepository.findByEmail(username).orElse(null);
        }
        if (user == null) {
            log.warn("Username {} unauthorized", username);
            throw new CustomMessageException(
                    "Unauthorized",
                    String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                    new EmptyObject(),
                    HttpStatus.UNAUTHORIZED);
        }

        if (!ApiConstant.ACTIVE.getKey().equals(user.getStatus())) {
            log.warn("Username {} blocked", username);
            throw new CustomMessageException(
                    "Blocked",
                    String.valueOf(HttpStatus.FORBIDDEN.value()),
                    new EmptyObject(),
                    HttpStatus.FORBIDDEN);
        }

        if ((user.getLoginAttempts() == null ? 0 : user.getLoginAttempts()) > (user.getMaxAttempts() == null ? 5 : user.getMaxAttempts())) {
            log.warn("Username {} attempt more than {}", username, user.getMaxAttempts());
            throw new CustomMessageException(
                    "Blocked",
                    String.valueOf(HttpStatus.FORBIDDEN.value()),
                    new EmptyObject(),
                    HttpStatus.FORBIDDEN);
        }

        List<String> roles = user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toCollection(ArrayList::new));
        if (isPlatformAdminEmail(user.getEmail())) {
            if (!roles.contains("ADMIN")) roles.add("ADMIN");
        } else {
            roles.removeIf("ADMIN"::equals);
            if (user.getTenantId() != null && !roles.contains("TENANT_ADMIN")) roles.add("TENANT_ADMIN");
        }
        return new CustomUserDetail(user.getUsername(), user.getPassword(),
                roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()), user.getTenantId());
    }

    private boolean isPlatformAdminEmail(String email) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(platformAdminEmails)) return false;
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        return java.util.Arrays.stream(platformAdminEmails.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(normalizedEmail::equals);
    }

    public void saveUserAttemptAuthentication(String username) {
         findActiveUser(username).ifPresent(
                user -> {
                    int attempt = (user.getLoginAttempts() == null ? 0 : user.getLoginAttempts()) + 1;
                    user.setLoginAttempts(attempt);
                    user.setUpdatedAt(LocalDateTime.now());
                    if(user.getLoginAttempts() > (user.getMaxAttempts() == null ? 5 : user.getMaxAttempts())){
                        log.warn("User {} update status to blocked", username);
                        user.setStatus(ApiConstant.BLK.getKey());
                    }
                    userRepository.save(user);
                }
        );
    }

    public void updateAttempt(String username) {
        findActiveUser(username).ifPresent(
                user -> {
                    user.setLoginAttempts(0);
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                }
        );
    }

    /** Resolves a login identifier that may be either a username or an email. */
    private java.util.Optional<User> findActiveUser(String identifier) {
        java.util.Optional<User> user =
                userRepository.findFirstByUsernameAndStatus(identifier, ApiConstant.ACTIVE.getKey());
        if (user.isEmpty()) {
            user = userRepository.findByEmail(identifier)
                    .filter(found -> ApiConstant.ACTIVE.getKey().equals(found.getStatus()));
        }
        return user;
    }

}
