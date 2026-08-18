package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.GroupFilterRequest;
import com.ticket.userservice.dto.request.GroupRequest;

public interface GroupService {

    ResponseErrorTemplate create(GroupRequest request);

    ResponseErrorTemplate update(Long id, GroupRequest request);

    ResponseErrorTemplate findById(Long id);

    ResponseErrorTemplate findAll(GroupFilterRequest filterRequest);

    ResponseErrorTemplate getMembers(Long groupId);

    ResponseErrorTemplate addMember(Long groupId, Long userId);

    ResponseErrorTemplate deleteMember(Long groupId, Long userId);

    ResponseErrorTemplate addPermission(Long groupId, Long permissionId);

    ResponseErrorTemplate removePermission(Long groupId, Long permissionId);

    void delete(Long id);
}
