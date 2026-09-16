package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.PermissionRequest;
import com.ticket.userservice.dto.request.PermissionFilterRequest;

public interface PermissionService {

    ResponseErrorTemplate create(PermissionRequest createPermissionRequestDTO);

    ResponseErrorTemplate update(Long id, PermissionRequest createPermissionRequestDTO);

    ResponseErrorTemplate findById(Long id);

    ResponseErrorTemplate findByName(String name);

    ResponseErrorTemplate findAll(PermissionFilterRequest filterRequest);

    ResponseErrorTemplate assignRoleToPermission(Long permissionId, Long roleId);

    ResponseErrorTemplate removeRoleFromPermission(Long permissionId, Long roleId);

     ResponseErrorTemplate delete(Long id);
}
