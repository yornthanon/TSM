package com.ticket.userservice.dto.response;

import com.ticket.common.dto.BasedDTO;
import com.ticket.userservice.entity.Group;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class CreateGroupResponseDTO extends BasedDTO {
    private Long id;
    private String name;
    private String description;
    private Set<String> permissions;
    private Set<String> roles;
    private int memberCount;
    private String status;

    public static CreateGroupResponseDTO from(Group group) {
        CreateGroupResponseDTO dto = new CreateGroupResponseDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setMemberCount(group.getUsers().size());
        dto.setStatus(group.getStatus());
        dto.setPermissions(group.getPermissions().stream()
                .map(p -> p.getName())
                .collect(Collectors.toSet()));
        dto.setRoles(group.getRoles().stream()
                .map(r -> r.getName())
                .collect(Collectors.toSet()));
        dto.setCreatedAt(group.getCreatedAt());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setUpdatedBy(group.getUpdatedBy());
        return dto;
    }
}
