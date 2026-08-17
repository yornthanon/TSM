package com.ticket.userservice.service.handle;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreateRoleRequestDTO;
import com.ticket.userservice.dto.response.CreateRoleResponseDTO;
import com.ticket.userservice.entity.Role;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class RoleHandlerService {

    public Role convertRoleRequestToRole(CreateRoleRequestDTO createRoleRequestDTO, Role role) {
        role.setDescription(createRoleRequestDTO.getDescription());
        role.setName(createRoleRequestDTO.getName());
        role.setStatus(createRoleRequestDTO.getStatus());
        return role;
    }

    public CreateRoleResponseDTO convertRoleToRoleResponse(Role role) {
        return CreateRoleResponseDTO.from(role);
    }

    public ResponseErrorTemplate roleRequestValidation(CreateRoleRequestDTO createRoleRequestDTO) {
        if (createRoleRequestDTO == null) {
            return new ResponseErrorTemplate("Role request is null", "INVALID_REQUEST", null, true);
        }

        if (!StringUtils.hasText(createRoleRequestDTO.getName())) {
            return new ResponseErrorTemplate("Role name is required", "INVALID_REQUEST", null, true);
        }

        if (createRoleRequestDTO.getName().length() < 3 || createRoleRequestDTO.getName().length() > 50) {
            return new ResponseErrorTemplate("Role name must be between 3 and 50 characters", "INVALID_REQUEST", null, true);
        }

        if (!createRoleRequestDTO.getName().matches("^[a-zA-Z0-9\\s_-]+$")) {
            return new ResponseErrorTemplate(
                    "Role name can only contain letters, numbers, spaces, underscores, and hyphens",
                    "INVALID_REQUEST", null, true);
        }

        if (createRoleRequestDTO.getDescription() != null && createRoleRequestDTO.getDescription().length() > 500) {
            return new ResponseErrorTemplate("Role description cannot exceed 500 characters", "INVALID_REQUEST", null, true);
        }

        if (!StringUtils.hasText(createRoleRequestDTO.getStatus())) {
            return new ResponseErrorTemplate("Role status is required", "INVALID_REQUEST", null, true);
        }

        if (!"ACTIVE".equals(createRoleRequestDTO.getStatus()) && !"INACTIVE".equals(createRoleRequestDTO.getStatus())) {
            return new ResponseErrorTemplate(
                    "Invalid role status. Must be either ACTIVE or INACTIVE",
                    "INVALID_REQUEST", null, true);
        }

        return null;
    }
}
