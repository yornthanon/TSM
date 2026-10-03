package com.ticket.userservice.dto.response;

public record MfaSetupResponse(String secret, String provisioningUri) {}
