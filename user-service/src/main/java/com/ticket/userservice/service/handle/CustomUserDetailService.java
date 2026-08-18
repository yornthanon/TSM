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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return this.customUserDetail(username);

    }

    public CustomUserDetail customUserDetail(String username) {
        // Load user regardless of status to give correct error for blocked users
        User user = userRepository.findByUsername(username);
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

        if (user.getLoginAttempts() > user.getMaxAttempts()) {
            log.warn("Username {} attempt more than {}", username, user.getMaxAttempts());
            throw new CustomMessageException(
                    "Blocked",
                    String.valueOf(HttpStatus.FORBIDDEN.value()),
                    new EmptyObject(),
                    HttpStatus.FORBIDDEN);
        }

        return new CustomUserDetail(
                user.getUsername(),
                user.getPassword(),
                user.getRoles()
                        .stream().map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList()));
    }

    public void saveUserAttemptAuthentication(String username) {
         userRepository.findFirstByUsernameAndStatus(username, ApiConstant.ACTIVE.getKey()).ifPresent(
                user -> {
                    int attempt = user.getLoginAttempts() + 1;
                    user.setLoginAttempts(attempt);
                    user.setUpdatedAt(LocalDateTime.now());
                    if(user.getLoginAttempts() > user.getMaxAttempts()){
                        log.warn("User {} update status to blocked", username);
                        user.setStatus(ApiConstant.BLK.getKey());
                    }
                    userRepository.save(user);
                }
        );
    }

    public void updateAttempt(String username) {
        userRepository.findFirstByUsernameAndStatus(username, ApiConstant.ACTIVE.getKey()).ifPresent(
                user -> {
                    user.setLoginAttempts(0);
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                }
        );
    }

}