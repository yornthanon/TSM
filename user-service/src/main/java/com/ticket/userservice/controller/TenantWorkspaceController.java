package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.userservice.service.TenantWorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class TenantWorkspaceController {
    private final TenantWorkspaceService workspaceService;

    @GetMapping("/current")
    public ResponseEntity<ResponseErrorTemplate> currentWorkspace() {
        return ApiResponse.from(new ResponseErrorTemplate(
                "Workspace retrieved successfully", "WORKSPACE_FOUND", workspaceService.currentWorkspace(), false));
    }
}
