package com.ticket.userservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record MfaCodeRequest(@NotBlank String code) {}
