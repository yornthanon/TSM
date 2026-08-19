package com.ticket.userservice.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
public class JwtConfigProperties {

    @Value("${jwt.url}")
    public String url;
    @Value("${jwt.header}")
    public String header;
    @Value("${jwt.prefix}")
    public String prefix;
    @Value("${jwt.expiration}")
    public Long expiration;
    @Value("${jwt.refresh-token-expiration}")
    public Long refreshTokenExpiration;
    @Value("${jwt.secret}")
    public String secret;
}