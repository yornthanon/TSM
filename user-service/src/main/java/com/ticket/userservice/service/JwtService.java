package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.entity.CustomUserDetail;
import io.jsonwebtoken.Claims;

import java.security.Key;

public interface JwtService {

    Claims extractClaims(String token);

    Key getKey();

    String generateToken(CustomUserDetail customUserDetail);

    String refreshToken(CustomUserDetail customUserDetail);

    boolean isValidToken(String token);

    ResponseErrorTemplate verifyToken(String authorizationHeader);
}
