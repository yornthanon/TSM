package com.ticket.userservice.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record UserProfileResponse(
        Long id,
        String username,
        String firstName,
        String lastName,
        String userImg,
        String email,
        String userType,
        String gender,
        String dateOfBirth,
        String phoneNumber,
        String status,
        List<String> roles,
        List<String> groups,
        Long tenantId,
        boolean mfaEnabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
