package com.ticket.userservice.service.impl;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreatePermissionRequestDTO;
import com.ticket.userservice.dto.response.CreatePermissionResponseDTO;
import com.ticket.userservice.entity.Permission;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.repository.PermissionRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    public ResponseErrorTemplate create(CreatePermissionRequestDTO createPermissionRequestDTO) {
        if (!StringUtils.hasText(createPermissionRequestDTO.getName())) {
            throw new BasedException("PERMISSION_NAME_REQUIRED", "Permission name is required", null, "name", null);
        }
        if (permissionRepository.findByName(createPermissionRequestDTO.getName()).isPresent()) {
            throw new BasedException("PERMISSION_ALREADY_EXISTS", "Permission already exists: " + createPermissionRequestDTO.getName(), null, "name", createPermissionRequestDTO.getName());
        }

        Permission permission = new Permission();
        permission.setName(createPermissionRequestDTO.getName());
        permission.setDescription(createPermissionRequestDTO.getDescription());
        permission.setStatus(createPermissionRequestDTO.getStatus());
        permissionRepository.save(permission);

        return new ResponseErrorTemplate(
                "Permission created successfully",
                "PERMISSION_CREATED",
                CreatePermissionResponseDTO.from(permission),
                false
        );
    }

    @Override
    public ResponseErrorTemplate update(Long id, CreatePermissionRequestDTO createPermissionRequestDTO) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with id: " + id, null, "id", String.valueOf(id)));

        permission.setName(createPermissionRequestDTO.getName());
        permission.setDescription(createPermissionRequestDTO.getDescription());
        permission.setStatus(createPermissionRequestDTO.getStatus());
        permissionRepository.save(permission);

        return new ResponseErrorTemplate(
                "Permission updated successfully",
                "PERMISSION_UPDATED",
                CreatePermissionResponseDTO.from(permission),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with id: " + id, null, "id", String.valueOf(id)));
        return new ResponseErrorTemplate(
                "Permission retrieved successfully",
                "PERMISSION_FOUND",
                CreatePermissionResponseDTO.from(permission),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findByName(String name) {
        Permission permission = permissionRepository.findByName(name)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with name: " + name, null, "name", name));
        return new ResponseErrorTemplate(
                "Permission retrieved successfully",
                "PERMISSION_FOUND",
                CreatePermissionResponseDTO.from(permission),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findAll(Pageable pageable) {
        Page<CreatePermissionResponseDTO> page = permissionRepository.findAll(pageable).map(CreatePermissionResponseDTO::from);
        return new ResponseErrorTemplate(
                "Permissions retrieved successfully",
                "PERMISSIONS_FOUND",
                page,
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate assignRoleToPermission(Long permissionId, Long roleId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with id: " + permissionId, null, "permissionId", String.valueOf(permissionId)));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BasedException("ROLE_NOT_FOUND", "Role not found with id: " + roleId, null, "roleId", String.valueOf(roleId)));

        if (permission.getRoles().contains(role)) {
            throw new BasedException("ROLE_ALREADY_ASSIGNED", "Role already assigned to permission", null, "roleId", String.valueOf(roleId));
        }

        role.getPermissions().add(permission);
        roleRepository.save(role);

        return new ResponseErrorTemplate(
                "Role assigned to permission successfully",
                "ROLE_ASSIGNED",
                CreatePermissionResponseDTO.from(permission),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate removeRoleFromPermission(Long permissionId, Long roleId) {
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with id: " + permissionId, null, "permissionId", String.valueOf(permissionId)));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BasedException("ROLE_NOT_FOUND", "Role not found with id: " + roleId, null, "roleId", String.valueOf(roleId)));

        if (!permission.getRoles().contains(role)) {
            throw new BasedException("ROLE_NOT_ASSIGNED", "Role not assigned to permission", null, "roleId", String.valueOf(roleId));
        }

        role.getPermissions().remove(permission);
        roleRepository.save(role);

        return new ResponseErrorTemplate(
                "Role removed from permission successfully",
                "ROLE_REMOVED",
                CreatePermissionResponseDTO.from(permission),
                false
        );
    }

    @Override
    public void delete(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with id: " + id, null, "id", String.valueOf(id)));
        permissionRepository.delete(permission);
    }
}
