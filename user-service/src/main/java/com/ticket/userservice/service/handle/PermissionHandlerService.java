package com.ticket.userservice.service.handle;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.PermissionRequest;
import com.ticket.userservice.dto.response.PermissionResponse;
import com.ticket.userservice.entity.Permission;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PermissionHandlerService {

    public Permission convertPermissionRequestToPermission(PermissionRequest request, Permission permission) {
        permission.setName(request.name());
        permission.setDescription(request.description());
        permission.setStatus(request.status());
        return permission;
    }

    public PermissionResponse convertPermissionToPermissionResponse(Permission permission) {
        return PermissionResponse.from(permission);
    }

    public ResponseErrorTemplate permissionRequestValidation(PermissionRequest request) {
        if (request == null) {
            return new ResponseErrorTemplate("Permission request is null", "INVALID_REQUEST", null, true);
        }

        String name = request.name();
        if (!StringUtils.hasText(name)) {
            return new ResponseErrorTemplate("Permission name is required", "INVALID_REQUEST", null, true);
        }
        if (name.length() < 3 || name.length() > 50) {
            return new ResponseErrorTemplate("Permission name must be between 3 and 50 characters", "INVALID_REQUEST", null, true);
        }
        if (!name.matches("^[a-zA-Z0-9\\s_-]+$")) {
            return new ResponseErrorTemplate(
                    "Permission name can only contain letters, numbers, spaces, underscores, and hyphens",
                    "INVALID_REQUEST", null, true);
        }

        String description = request.description();
        if (description != null && description.length() > 500) {
            return new ResponseErrorTemplate("Permission description cannot exceed 500 characters", "INVALID_REQUEST", null, true);
        }

        String status = request.status();
        if (!StringUtils.hasText(status)) {
            return new ResponseErrorTemplate("Permission status is required", "INVALID_REQUEST", null, true);
        }
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) {
            return new ResponseErrorTemplate(
                    "Invalid permission status. Must be either ACTIVE or INACTIVE",
                    "INVALID_REQUEST", null, true);
        }

        return null;
    }
}
