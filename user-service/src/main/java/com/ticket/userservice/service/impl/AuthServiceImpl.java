package com.ticket.userservice.service.impl;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.AuthenticationRequest;
import com.ticket.userservice.dto.response.AuthenticationResponse;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.service.AuthService;
import com.ticket.userservice.service.JwtService;
import com.ticket.userservice.service.TotpMfaService;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailService customUserDetailService;
    private final TotpMfaService mfaService;

    @Override
    public ResponseErrorTemplate login(AuthenticationRequest authenticationRequest) {
        final String username = authenticationRequest.username();
        final String password = authenticationRequest.password();

        CustomUserDetail customUserDetail = customUserDetailService.customUserDetail(username);

        if (!StringUtils.hasText(password)) {
            log.error("Password is empty for user: {}", username);
            return new ResponseErrorTemplate(
                    "Password cannot be empty",
                    ApiConstant.INVALID_REQUEST.getKey(),
                    new EmptyObject(),
                    true
            );
        }

        if (!passwordEncoder.matches(password, customUserDetail.getPassword())) {
            log.error("Invalid password for user: {}", username);
            customUserDetailService.saveUserAttemptAuthentication(username);
            return new ResponseErrorTemplate(
                    "Invalid password",
                    ApiConstant.FORBIDDEN.getKey(),
                    new EmptyObject(),
                    true
            );
        }

        if (mfaService.isEnabledFor(username)) {
            if (!StringUtils.hasText(authenticationRequest.totpCode())) {
                customUserDetailService.saveUserAttemptAuthentication(username);
                return failure("Enter your authenticator code to finish signing in.", "MFA_REQUIRED");
            }
            if (!mfaService.verifyLoginCode(username, authenticationRequest.totpCode())) {
                customUserDetailService.saveUserAttemptAuthentication(username);
                return failure("The authenticator code is invalid. Try the current 6-digit code.", "MFA_INVALID");
            }
        }
        customUserDetailService.updateAttempt(username);

        return new ResponseErrorTemplate(
                ApiConstant.LOGIN_SUCCESS.getDescription(),
                ApiConstant.LOGIN_SUCCESS.getKey(),
                new AuthenticationResponse(
                        jwtService.generateToken(customUserDetail),
                        jwtService.refreshToken(customUserDetail)),
                false);
    }

    private ResponseErrorTemplate failure(String message, String code) {
        return new ResponseErrorTemplate(message, code, new EmptyObject(), true);
    }
}
