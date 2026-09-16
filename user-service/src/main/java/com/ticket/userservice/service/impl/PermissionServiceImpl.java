package com.ticket.userservice.service.impl;

import com.ticket.common.criteria.BaseSearchCriteria;
import com.ticket.common.criteria.SearchCriteria;
import com.ticket.common.criteria.SearchOperation;
import com.ticket.common.dto.request.PageableRequestVO;
import com.ticket.common.dto.response.PageableResponseVO;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.repository.BaseRepository;
import com.ticket.userservice.dto.request.PermissionRequest;
import com.ticket.userservice.dto.request.PermissionFilterRequest;
import com.ticket.userservice.dto.response.PermissionResponse;
import com.ticket.userservice.entity.Permission;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.exception.PermissionValidationException;
import com.ticket.userservice.repository.PermissionRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.service.PermissionService;
import com.ticket.userservice.service.handle.PermissionHandlerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PermissionServiceImpl implements PermissionService {

    private final BaseRepository baseRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final PermissionHandlerService permissionHandlerService;

    public PermissionServiceImpl(BaseRepository baseRepository,
                                 PermissionRepository permissionRepository,
                                 RoleRepository roleRepository,
                                 PermissionHandlerService permissionHandlerService) {
        this.baseRepository = baseRepository;
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.permissionHandlerService = permissionHandlerService;
    }

    @Override
    @Transactional
    public ResponseErrorTemplate create(PermissionRequest request) {
        ResponseErrorTemplate validation = permissionHandlerService.permissionRequestValidation(request);
        if (validation != null && validation.isError()) {
            return validation;
        }

        if (baseRepository.getByField("name", request.name(), Permission.class) != null) {
            throw new PermissionValidationException("name", "Permission already exists: " + request.name());
        }

        Permission permission = permissionHandlerService.convertPermissionRequestToPermission(request, new Permission());
        baseRepository.saveOrUpdate(permission);

        return new ResponseErrorTemplate(
                "Permission created successfully",
                "PERMISSION_CREATED",
                permissionHandlerService.convertPermissionToPermissionResponse(permission),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate update(Long id, PermissionRequest request) {
        Permission permission = baseRepository.getByField("id", id, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with id: " + id,
                    null,
                    "id",
                    String.valueOf(id)
            );
        }

        ResponseErrorTemplate validation = permissionHandlerService.permissionRequestValidation(request);
        if (validation != null && validation.isError()) {
            return validation;
        }

        if (!permission.getName().equals(request.name())
                && baseRepository.getByField("name", request.name(), Permission.class) != null) {
            throw new PermissionValidationException("name", "Permission already exists: " + request.name());
        }

        permissionHandlerService.convertPermissionRequestToPermission(request, permission);
        baseRepository.saveOrUpdate(permission);

        return new ResponseErrorTemplate(
                "Permission updated successfully",
                "PERMISSION_UPDATED",
                permissionHandlerService.convertPermissionToPermissionResponse(permission),
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseErrorTemplate findById(Long id) {
        Permission permission = baseRepository.getByField("id", id, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with id: " + id,
                    null,
                    "id",
                    String.valueOf(id)
            );
        }
        return new ResponseErrorTemplate(
                "Permission retrieved successfully",
                "PERMISSION_FOUND",
                permissionHandlerService.convertPermissionToPermissionResponse(permission),
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseErrorTemplate findByName(String name) {
        Permission permission = baseRepository.getByField("name", name, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with name: " + name,
                    null,
                    "name",
                    name
            );
        }
        return new ResponseErrorTemplate(
                "Permission retrieved successfully",
                "PERMISSION_FOUND",
                permissionHandlerService.convertPermissionToPermissionResponse(permission),
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseErrorTemplate findAll(PermissionFilterRequest filterRequest) {
        BaseSearchCriteria criteria = new BaseSearchCriteria();
        boolean hasFilter = false;

        if (filterRequest.hasId()) {
            criteria.addCriteria(new SearchCriteria("id", filterRequest.getId(), SearchOperation.EQUAL));
            hasFilter = true;
        }
        if (filterRequest.hasName()) {
            criteria.addCriteria(new SearchCriteria("name", filterRequest.getName(), SearchOperation.MATCH));
            hasFilter = true;
        }
        if (filterRequest.hasStatus()) {
            criteria.addCriteria(new SearchCriteria("status", filterRequest.getStatus().toUpperCase(), SearchOperation.EQUAL));
            hasFilter = true;
        }

        PageableRequestVO pageable = PageableRequestVO.of(
                filterRequest.getPageNumber(),
                filterRequest.getPageSize(),
                filterRequest.getSortBy(),
                filterRequest.isDesc());

        PageableResponseVO<Permission> page = hasFilter
                ? baseRepository.listPage(Permission.class, criteria, pageable)
                : baseRepository.listPage(Permission.class, pageable);

        List<PermissionResponse> content = page.getContent().stream()
                .map(permissionHandlerService::convertPermissionToPermissionResponse)
                .toList();

        PageableResponseVO<PermissionResponse> response = PageableResponseVO.of(
                content,
                page.getTotalElements(),
                page.getPageNumber(),
                page.getPageSize());

        return new ResponseErrorTemplate(
                "Permissions retrieved successfully",
                "PERMISSIONS_FOUND",
                response,
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate assignRoleToPermission(Long permissionId, Long roleId) {
        Permission permission = baseRepository.getByField("id", permissionId, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with id: " + permissionId,
                    null,
                    "permissionId",
                    String.valueOf(permissionId)
            );
        }

        Role role = baseRepository.getByField("id", roleId, Role.class);
        if (role == null) {
            throw new BasedException(
                    "ROLE_NOT_FOUND",
                    "Role not found with id: " + roleId,
                    null,
                    "roleId",
                    String.valueOf(roleId)
            );
        }

        role.getPermissions().add(permission);
        baseRepository.saveOrUpdate(role);

        return new ResponseErrorTemplate(
                "Role assigned to permission successfully",
                "PERMISSION_ROLE_ASSIGNED",
                permissionHandlerService.convertPermissionToPermissionResponse(permission),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate removeRoleFromPermission(Long permissionId, Long roleId) {
        Permission permission = baseRepository.getByField("id", permissionId, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with id: " + permissionId,
                    null,
                    "permissionId",
                    String.valueOf(permissionId)
            );
        }

        Role role = baseRepository.getByField("id", roleId, Role.class);
        if (role == null) {
            throw new BasedException(
                    "ROLE_NOT_FOUND",
                    "Role not found with id: " + roleId,
                    null,
                    "roleId",
                    String.valueOf(roleId)
            );
        }

        role.getPermissions().remove(permission);
        baseRepository.saveOrUpdate(role);

        return new ResponseErrorTemplate(
                "Role removed from permission successfully",
                "PERMISSION_ROLE_REMOVED",
                permissionHandlerService.convertPermissionToPermissionResponse(permission),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate delete(Long id) {
        Permission permission = baseRepository.getByField("id", id, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with id: " + id,
                    null,
                    "id",
                    String.valueOf(id)
            );
        }
        baseRepository.delete(permission);
        return new ResponseErrorTemplate(
                "Permission deleted successfully",
                "PERMISSION_DELETED",
                null,
                false
        );
    }
}
