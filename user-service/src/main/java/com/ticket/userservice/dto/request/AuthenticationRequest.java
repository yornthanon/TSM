package com.ticket.userservice.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record AuthenticationRequest(
        @NotBlank(message = "Username is required") String username,
        @NotBlank(message = "Password is required") String password,
        @JsonAlias("otp") String totpCode) {

    public AuthenticationRequest(String username, String password) {
        this(username, password, null);
    }
}
