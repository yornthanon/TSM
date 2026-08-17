package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreatePermissionRequestDTO;
import com.ticket.userservice.service.PermissionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
    public ResponseEntity<ResponseErrorTemplate> createPermission(@Valid @RequestBody CreatePermissionRequestDTO createPermissionRequestDTO) {
        return ResponseEntity.ok(permissionService.create(createPermissionRequestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updatePermission(@PathVariable Long id, @Valid @RequestBody CreatePermissionRequestDTO createPermissionRequestDTO) {
        return ResponseEntity.ok(permissionService.update(id, createPermissionRequestDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getPermissionById(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.findById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ResponseErrorTemplate> getPermissionByName(@PathVariable String name) {
        return ResponseEntity.ok(permissionService.findByName(name));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> getAllPermissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(permissionService.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))));
    }

    @PostMapping("/{permissionId}/roles/{roleId}")
    public ResponseEntity<ResponseErrorTemplate> assignRoleToPermission(@PathVariable Long permissionId, @PathVariable Long roleId) {
        return ResponseEntity.ok(permissionService.assignRoleToPermission(permissionId, roleId));
    }

    @DeleteMapping("/{permissionId}/roles/{roleId}")
    public ResponseEntity<ResponseErrorTemplate> removeRoleFromPermission(@PathVariable Long permissionId, @PathVariable Long roleId) {
        return ResponseEntity.ok(permissionService.removeRoleFromPermission(permissionId, roleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deletePermission(@PathVariable Long id) {
        permissionService.delete(id);
        return ResponseEntity.ok(new ResponseErrorTemplate(
                "Permission deleted successfully",
                "PERMISSION_DELETED",
                null,
                false
        ));
    }
}
