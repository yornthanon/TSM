package com.ticket.userservice.controller;


import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.AuthenticationRequest;
import com.ticket.userservice.dto.request.RefreshTokenRequest;
import com.ticket.userservice.dto.request.UserRequest;
import com.ticket.userservice.service.AuthService;
import com.ticket.userservice.service.JwtService;
import com.ticket.userservice.service.UserService;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import com.ticket.userservice.service.impl.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@Slf4j
@RequestMapping({"/api/v1/auth", "/api/public/users"})
@RequiredArgsConstructor
public class PublicController {

    private final AuthService authService;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final CustomUserDetailService customUserDetailService;
    private final JwtService jwtService;

    @PostMapping({"/register", "/registration"})
    public ResponseEntity<ResponseErrorTemplate> register(@Valid @RequestBody UserRequest userRequest) {
        log.info("Intercept registration new user with req: {}", userRequest);
        return ResponseEntity.ok(userService.create(userRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<com.ticket.common.exception.ResponseErrorTemplate> login(@Valid @RequestBody AuthenticationRequest authenticationRequest) {
        return ResponseEntity.ok(authService.login(authenticationRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseErrorTemplate> logout(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        log.info("Intercept logout refresh token with req: {}", refreshTokenRequest);
        refreshTokenService.deleteToken(refreshTokenRequest.refreshToken());
        var responseErrorTemplate = new ResponseErrorTemplate(
                ApiConstant.LOGOUT_SUCCESS.getDescription(),
                ApiConstant.LOGOUT_SUCCESS.getKey(),
                new EmptyObject(),
                false);
        return ResponseEntity.ok(responseErrorTemplate);
    }

    @PostMapping({"/refresh-token", "/refreshToken"})
    public ResponseEntity<ResponseErrorTemplate> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return ResponseEntity.ok(refreshTokenService.refreshToken(refreshTokenRequest));
    }

    @PostMapping("/verify-token")
    public ResponseEntity<ResponseErrorTemplate> verifyToken(@RequestHeader("Authorization") String authorizationHeader) {
        log.info("Intercept token verification request");
        
        var responseErrorTemplate = jwtService.verifyToken(authorizationHeader);
        if (responseErrorTemplate.isError()) {
            return ResponseEntity.status(401).body(responseErrorTemplate);
        }
        return ResponseEntity.status(200).body(responseErrorTemplate);
    }

}