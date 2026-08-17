package com.ticket.userservice.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequestDTO {

    @NotBlank(message = "Group name is required")
    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    private Set<String> roleNames;

    private Set<String> permissionNames;

    @JsonProperty("status")
    private String status;
}
