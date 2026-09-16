package com.ticket.userservice.service.handle;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.GroupRequest;
import com.ticket.userservice.dto.response.GroupResponse;
import com.ticket.userservice.entity.Group;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class GroupHandlerService {

    public Group convertGroupRequestToGroup(GroupRequest request, Group group) {
        group.setName(request.name());
        group.setDescription(request.description());
        group.setStatus(request.status());
        return group;
    }

    public GroupResponse convertGroupToGroupResponse(Group group) {
        return GroupResponse.from(group);
    }

    public ResponseErrorTemplate groupRequestValidation(GroupRequest request) {
        if (request == null) {
            return new ResponseErrorTemplate("Group request is null", "INVALID_REQUEST", null, true);
        }

        String name = request.name();
        if (!StringUtils.hasText(name)) {
            return new ResponseErrorTemplate("Group name is required", "INVALID_REQUEST", null, true);
        }
        if (name.length() < 3 || name.length() > 50) {
            return new ResponseErrorTemplate("Group name must be between 3 and 50 characters", "INVALID_REQUEST", null, true);
        }
        if (!name.matches("^[a-zA-Z0-9\\s_-]+$")) {
            return new ResponseErrorTemplate(
                    "Group name can only contain letters, numbers, spaces, underscores, and hyphens",
                    "INVALID_REQUEST", null, true);
        }

        String description = request.description();
        if (description != null && description.length() > 500) {
            return new ResponseErrorTemplate("Group description cannot exceed 500 characters", "INVALID_REQUEST", null, true);
        }

        String status = request.status();
        if (!StringUtils.hasText(status)) {
            return new ResponseErrorTemplate("Group status is required", "INVALID_REQUEST", null, true);
        }
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status)) {
            return new ResponseErrorTemplate(
                    "Invalid group status. Must be either ACTIVE or INACTIVE",
                    "INVALID_REQUEST", null, true);
        }

        return null;
    }
}
