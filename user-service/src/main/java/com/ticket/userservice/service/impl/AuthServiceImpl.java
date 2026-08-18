package com.ticket.userservice.service.impl;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.AuthenticationRequest;
import com.ticket.userservice.dto.response.AuthenticationResponse;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.service.AuthService;
import com.ticket.userservice.service.JwtService;
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

        return new ResponseErrorTemplate(
                ApiConstant.LOGIN_SUCCESS.getDescription(),
                ApiConstant.LOGIN_SUCCESS.getKey(),
                new AuthenticationResponse(
                        jwtService.generateToken(customUserDetail),
                        jwtService.refreshToken(customUserDetail)),
                false);
    }
}
