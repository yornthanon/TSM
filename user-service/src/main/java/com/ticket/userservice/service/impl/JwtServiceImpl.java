package com.ticket.userservice.service.impl;

import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.CustomMessageException;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.config.properties.JwtConfigProperties;
import com.ticket.userservice.entity.CustomUserDetail;
import com.ticket.userservice.jwt.JwtSecret;
import com.ticket.userservice.service.JwtService;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtServiceImpl extends JwtConfigProperties implements JwtService {

    private final JwtSecret jwtSecret;
    private final RefreshTokenService refreshTokenService;
    private final CustomUserDetailService userDetailService;

    @Override
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public Key getKey() {
        return jwtSecret.getSecretKey(secret);
    }

    @Override
    public String generateToken(CustomUserDetail customUserDetail) {
        List<String> roles = new ArrayList<>();

        customUserDetail.getAuthorities().forEach(role -> roles.add(role.getAuthority()));

        Instant currentTime = Instant.now();
        return Jwts.builder()
                .subject(customUserDetail.getUsername())
                .claim("authorities", customUserDetail.getAuthorities()
                        .stream().map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList()))
                .claim("roles", roles)
                .claim("isEnable", customUserDetail.isEnabled())
                .issuedAt(Date.from(currentTime))
                .expiration(Date.from(currentTime.plusSeconds(getExpiration())))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    @Override
    public String refreshToken(CustomUserDetail customUserDetail) {
        Instant currentTime = Instant.now();
        var tokenExpiration = Date.from(currentTime.plusMillis(600000));
        var refreshToken = Jwts.builder()
                .subject(customUserDetail.getUsername())
                .issuedAt(Date.from(currentTime))
                .expiration(tokenExpiration)
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
        refreshTokenService.createRefreshToken(customUserDetail.getUsername(), refreshToken, tokenExpiration);
        return refreshToken;
    }

    @Override
    public boolean isValidToken(String token) {
        final String username = extractUsername(token);
        UserDetails userDetails = userDetailService.loadUserByUsername(username);
        return userDetails != null;
    }

    @Override
    public ResponseErrorTemplate verifyToken(String authorizationHeader) {
        try {
            String token = authorizationHeader;
            if (authorizationHeader.startsWith("Bearer ")) {
                token = authorizationHeader.substring(7);
            }

            if (!isValidToken(token)) {
                return new ResponseErrorTemplate(
                        "Invalid token",
                        "TOKEN_INVALID",
                        new EmptyObject(),
                        true);
            }

            Claims claims = extractClaims(token);
            String username = claims.getSubject();
            List authorities = claims.get("authorities", List.class);

            Map<String, Object> tokenData = new HashMap<>();
            tokenData.put("username", username);
            tokenData.put("authorities", authorities);
            tokenData.put("valid", true);

            return new ResponseErrorTemplate(
                    "Token is valid",
                    "TOKEN_VALID",
                    tokenData,
                    false);

        } catch (Exception ex) {
            log.error("Token verification failed: {}", ex.getMessage());
            return new ResponseErrorTemplate(
                    "Token verification failed",
                    "TOKEN_VERIFICATION_FAILED",
                    new EmptyObject(),
                    true);
        }
    }

    private String extractUsername(String token) {
        return extractClaimsTFunction(token, Claims::getSubject);
    }

    private <T> T extractClaimsTFunction(String token, Function<Claims, T> claimsTFunction) {
        final Claims claims = extractAllClaims(token);
        return claimsTFunction.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith((SecretKey) getKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            log.error(ex.getLocalizedMessage());
            throw new CustomMessageException(
                    "Token expiration",
                    String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                    new EmptyObject(),
                    HttpStatus.UNAUTHORIZED);
        } catch (UnsupportedJwtException ex) {
            log.error(ex.getLocalizedMessage());
            throw new CustomMessageException(
                    "Token is not support.",
                    String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                    new EmptyObject(),
                    HttpStatus.UNAUTHORIZED);
        } catch (MalformedJwtException | SignatureException ex) {
            log.error(ex.getLocalizedMessage());
            throw new CustomMessageException(
                    "Token is invalid format.",
                    String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                    new EmptyObject(),
                    HttpStatus.UNAUTHORIZED);
        } catch (Exception ex) {
            log.error(ex.getLocalizedMessage());
            throw new CustomMessageException(
                    ex.getLocalizedMessage(),
                    String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                    new EmptyObject(),
                    HttpStatus.UNAUTHORIZED);
        }
    }
}
