package com.ticket.userservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MfaDisableRequest(@NotBlank String password, @NotBlank String code) {}
