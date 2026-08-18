package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.RoleFilterRequest;
import com.ticket.userservice.dto.request.RoleRequest;
import com.ticket.userservice.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseErrorTemplate> createRole(@Valid @RequestBody RoleRequest roleRequest) {
        return ResponseEntity.ok(roleService.create(roleRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updateRole(@PathVariable Long id, @Valid @RequestBody RoleRequest roleRequest) {
        return ResponseEntity.ok(roleService.update(id, roleRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getRoleById(@PathVariable Long id) {
        return ResponseEntity.ok(roleService.findById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ResponseErrorTemplate> getRoleByName(@PathVariable String name) {
        return ResponseEntity.ok(roleService.findByName(name));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> getAllRoles(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "true") boolean desc) {
        RoleFilterRequest filter = new RoleFilterRequest();
        filter.setId(id);
        filter.setName(name);
        filter.setStatus(status);
        filter.setPageNumber(page);
        filter.setPageSize(size);
        filter.setSortBy(sortBy);
        filter.setDesc(desc);
        return ResponseEntity.ok(roleService.findAll(filter));
    }

    @GetMapping("/active")
    public ResponseEntity<ResponseErrorTemplate> getAllActiveRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "true") boolean desc) {
        RoleFilterRequest filter = new RoleFilterRequest();
        filter.setStatus("ACTIVE");
        filter.setPageNumber(page);
        filter.setPageSize(size);
        filter.setSortBy(sortBy);
        filter.setDesc(desc);
        return ResponseEntity.ok(roleService.findAll(filter));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deleteRole(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.ok(new ResponseErrorTemplate(
                "Role deleted successfully",
                "ROLE_DELETED",
                null,
                false
        ));
    }
}
