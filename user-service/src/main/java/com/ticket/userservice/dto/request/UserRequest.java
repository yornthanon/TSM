package com.ticket.userservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.Set;

public record UserRequest(
    @JsonProperty("id") Long id,

    @JsonProperty("username")
    @NotBlank(message = "Username is required")
    @Size(max = 50, message = "Username must not exceed 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    String username,

    @JsonProperty("firstName")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    String firstName,

    @JsonProperty("lastName")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    String lastName,

    @JsonProperty("userImg") String userImg,

    @JsonProperty("email")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    String email,

    @JsonProperty("password")
    @Size(min = 6, max = 128, message = "Password length must be between 6 and 128 characters")
    String password,

    @JsonProperty("userType") String userType,
    @JsonProperty("gender") String gender,
    @JsonProperty("dateOfBirth") String dateOfBirth,
    @JsonProperty("lastLogin") String lastLogin,
    @JsonProperty("loginAttempts") Integer loginAttempts,
    @JsonProperty("maxAttempts") Integer maxAttempts,
    @JsonProperty("enableAllocate") Boolean enableAllocate,

    @JsonProperty("status")
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status must be either ACTIVE or INACTIVE")
    String status,

    @JsonProperty("roles") Set<String> roles,
    @JsonProperty("phoneNumber") String phoneNumber,
    @JsonProperty("groupIds") Set<Long> groupIds,
    @JsonProperty("createdAt") LocalDateTime createdAt,
    @JsonProperty("updatedAt") LocalDateTime updatedAt
) {
}
