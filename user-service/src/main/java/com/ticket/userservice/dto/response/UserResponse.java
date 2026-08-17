package com.ticket.userservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.Set;

public record UserResponse(
    @JsonProperty("id") Long id,
    @JsonProperty("username") String username,
    @JsonProperty("firstName") String firstName,
    @JsonProperty("lastName") String lastName,
    @JsonProperty("userImg") String userImg,
    @JsonProperty("email") String email,
    @JsonProperty("userType") String userType,
    @JsonProperty("gender") String gender,
    @JsonProperty("dateOfBirth") String dateOfBirth,
    @JsonProperty("lastLogin") String lastLogin,
    @JsonProperty("loginAttempts") Integer loginAttempts,
    @JsonProperty("maxAttempts") Integer maxAttempts,
    @JsonProperty("enableAllocate") Boolean enableAllocate,
    @JsonProperty("phoneNumber") String phoneNumber,
    @JsonProperty("status") String status,
    @JsonProperty("roles") Set<String> roles,
    @JsonProperty("groups") Set<String> groups,
    @JsonProperty("createdAt") LocalDateTime createdAt,
    @JsonProperty("updatedAt") LocalDateTime updatedAt
) {
}
