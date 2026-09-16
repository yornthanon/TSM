package com.ticket.userservice.service.handle;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.RoleRequest;
import com.ticket.userservice.dto.response.RoleResponse;
import com.ticket.userservice.entity.Role;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class RoleHandlerService {

    public Role convertRoleRequestToRole(RoleRequest request, Role role) {
        role.setDescription(request.description());
        role.setName(request.name());
        role.setStatus(request.status());
        return role;
    }

    public RoleResponse convertRoleToRoleResponse(Role role) {
        return RoleResponse.from(role);
    }

    public ResponseErrorTemplate roleRequestValidation(RoleRequest request) {
        if (request == null) {
            return new ResponseErrorTemplate("Role request is null", "INVALID_REQUEST", null, true);
        }

        String name = request.name();
        if (!StringUtils.hasText(name)) {
            return new ResponseErrorTemplate("Role name is required", "INVALID_REQUEST", null, true);
        }

        if (name.length() < 3 || name.length() > 50) {
            return new ResponseErrorTemplate("Role name must be between 3 and 50 characters", "INVALID_REQUEST", null, true);
        }

        if (!name.matches("^[a-zA-Z0-9\\s_-]+$")) {
            return new ResponseErrorTemplate(
                    "Role name can only contain letters, numbers, spaces, underscores, and hyphens",
                    "INVALID_REQUEST", null, true);
        }

        String description = request.description();
        if (description != null && description.length() > 500) {
            return new ResponseErrorTemplate("Role description cannot exceed 500 characters", "INVALID_REQUEST", null, true);
        }

        String status = request.status();
        if (!StringUtils.hasText(status)) {
            return new ResponseErrorTemplate("Role status is required", "INVALID_REQUEST", null, true);
        }

        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) {
            return new ResponseErrorTemplate(
                    "Invalid role status. Must be either ACTIVE or INACTIVE",
                    "INVALID_REQUEST", null, true);
        }

        return null;
    }
}
