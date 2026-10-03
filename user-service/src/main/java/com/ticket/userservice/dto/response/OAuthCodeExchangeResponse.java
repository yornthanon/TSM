package com.ticket.userservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record OAuthCodeExchangeResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken,
        String username) {
}
