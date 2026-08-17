package com.ticket.userservice.dto.response;

import com.ticket.common.dto.BasedDTO;
import com.ticket.userservice.entity.Permission;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePermissionResponseDTO extends BasedDTO {
    private Long id;
    private String name;
    private String description;
    private String status;

    public static CreatePermissionResponseDTO from(Permission permission) {
        CreatePermissionResponseDTO dto = new CreatePermissionResponseDTO();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        dto.setStatus(permission.getStatus());
        dto.setCreatedAt(permission.getCreatedAt());
        dto.setCreatedBy(permission.getCreatedBy());
        dto.setUpdatedAt(permission.getUpdatedAt());
        dto.setUpdatedBy(permission.getUpdatedBy());
        return dto;
    }
}
