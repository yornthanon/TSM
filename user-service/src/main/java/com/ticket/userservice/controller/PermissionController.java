package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.userservice.dto.request.PermissionRequest;
import com.ticket.userservice.dto.request.PermissionFilterRequest;
import com.ticket.userservice.service.PermissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseErrorTemplate> createPermission(@Valid @RequestBody PermissionRequest createPermissionRequestDTO) {
        return ApiResponse.from(permissionService.create(createPermissionRequestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updatePermission(@PathVariable Long id, @Valid @RequestBody PermissionRequest createPermissionRequestDTO) {
        return ApiResponse.from(permissionService.update(id, createPermissionRequestDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getPermissionById(@PathVariable Long id) {
        return ApiResponse.from(permissionService.findById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ResponseErrorTemplate> getPermissionByName(@PathVariable String name) {
        return ApiResponse.from(permissionService.findByName(name));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> getAllPermissions(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "true") boolean desc) {
        PermissionFilterRequest filter = new PermissionFilterRequest();
        filter.setId(id);
        filter.setName(name);
        filter.setStatus(status);
        filter.setPageNumber(page);
        filter.setPageSize(size);
        filter.setSortBy(sortBy);
        filter.setDesc(desc);
        return ApiResponse.from(permissionService.findAll(filter));
    }

    @PostMapping("/{permissionId}/roles/{roleId}")
    public ResponseEntity<ResponseErrorTemplate> assignRoleToPermission(@PathVariable Long permissionId, @PathVariable Long roleId) {
        return ApiResponse.from(permissionService.assignRoleToPermission(permissionId, roleId));
    }

    @DeleteMapping("/{permissionId}/roles/{roleId}")
    public ResponseEntity<ResponseErrorTemplate> removeRoleFromPermission(@PathVariable Long permissionId, @PathVariable Long roleId) {
        return ApiResponse.from(permissionService.removeRoleFromPermission(permissionId, roleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deletePermission(@PathVariable Long id) {
        permissionService.delete(id);
        return ApiResponse.from(new ResponseErrorTemplate(
                "Permission deleted successfully",
                "PERMISSION_DELETED",
                null,
                false
        ));
    }
}
