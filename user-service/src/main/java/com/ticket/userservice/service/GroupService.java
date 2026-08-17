package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreateGroupRequestDTO;
import org.springframework.data.domain.Pageable;

public interface GroupService {
    ResponseErrorTemplate create(CreateGroupRequestDTO createGroupRequestDTO);

    ResponseErrorTemplate update(Long id, CreateGroupRequestDTO createGroupRequestDTO);

    ResponseErrorTemplate findById(Long id);

    ResponseErrorTemplate findAll(Pageable pageable);

    ResponseErrorTemplate getMembers(Long groupId);

    ResponseErrorTemplate addMember(Long groupId, Long userId);

    ResponseErrorTemplate deleteMember(Long groupId, Long userId);

    ResponseErrorTemplate addPermission(Long groupId, Long permissionId);

    ResponseErrorTemplate removePermission(Long groupId, Long permissionId);

    void delete(Long id);
}
