package com.ticket.userservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TenantWorkspaceStatusRequest(@NotBlank String status) {
}
