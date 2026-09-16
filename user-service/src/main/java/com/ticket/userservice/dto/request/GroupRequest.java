package com.ticket.userservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record GroupRequest(
        @NotBlank(message = "Group name is required")
        @JsonProperty("name")
        String name,

        @JsonProperty("description")
        String description,

        @JsonProperty("status")
        String status,

        @JsonProperty("roleNames")
        Set<String> roleNames,

        @JsonProperty("permissionNames")
        Set<String> permissionNames
) {
}
