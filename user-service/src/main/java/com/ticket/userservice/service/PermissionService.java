package com.ticket.userservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreatePermissionRequestDTO;
import org.springframework.data.domain.Pageable;

public interface PermissionService {

    ResponseErrorTemplate create(CreatePermissionRequestDTO createPermissionRequestDTO);

    ResponseErrorTemplate update(Long id, CreatePermissionRequestDTO createPermissionRequestDTO);

    ResponseErrorTemplate findById(Long id);

    ResponseErrorTemplate findByName(String name);

    ResponseErrorTemplate findAll(Pageable pageable);

    ResponseErrorTemplate assignRoleToPermission(Long permissionId, Long roleId);

    ResponseErrorTemplate removeRoleFromPermission(Long permissionId, Long roleId);

    void delete(Long id);
}
