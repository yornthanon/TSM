package com.ticket.userservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OAuthCodeExchangeRequest(
        @NotBlank @Size(max = 128) String code,
        @Size(max = 6) String totpCode) {
}
