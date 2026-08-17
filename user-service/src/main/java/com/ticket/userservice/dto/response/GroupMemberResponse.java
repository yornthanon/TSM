package com.ticket.userservice.dto.response;

import com.ticket.common.dto.BasedDTO;
import com.ticket.userservice.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupMemberResponse extends BasedDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String status;

    public static GroupMemberResponse from(User user) {
        GroupMemberResponse dto = new GroupMemberResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setCreatedBy(user.getCreatedBy());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setUpdatedBy(user.getUpdatedBy());
        return dto;
    }
}
