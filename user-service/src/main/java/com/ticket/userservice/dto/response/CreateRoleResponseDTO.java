package com.ticket.userservice.dto.response;

import com.ticket.common.dto.BasedDTO;
import com.ticket.userservice.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRoleResponseDTO extends BasedDTO {
    private Long id;
    private String name;
    private String description;
    private String status;

    public static CreateRoleResponseDTO from(Role role) {
        CreateRoleResponseDTO dto = new CreateRoleResponseDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setStatus(role.getStatus());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setCreatedBy(role.getCreatedBy());
        dto.setUpdatedAt(role.getUpdatedAt());
        dto.setUpdatedBy(role.getUpdatedBy());
        return dto;
    }
}
