package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.userservice.dto.request.TenantWorkspaceStatusRequest;
import com.ticket.userservice.service.TenantWorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/workspaces")
@RequiredArgsConstructor
public class AdminTenantWorkspaceController {
    private final TenantWorkspaceService workspaceService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> listWorkspaces() {
        return ApiResponse.from(new ResponseErrorTemplate(
                "Workspaces retrieved successfully", "WORKSPACES_FOUND", workspaceService.listAll(), false));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseErrorTemplate> updateWorkspaceStatus(
            @PathVariable Long id,
            @Valid @RequestBody TenantWorkspaceStatusRequest request) {
        return ApiResponse.from(new ResponseErrorTemplate(
                "Workspace updated successfully", "WORKSPACE_UPDATED",
                workspaceService.updateStatus(id, request.status()), false));
    }
}
