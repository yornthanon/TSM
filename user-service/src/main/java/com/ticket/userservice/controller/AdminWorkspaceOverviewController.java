package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.response.AdminWorkspaceOverviewResponse;
import com.ticket.userservice.service.AdminWorkspaceOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/overview")
@RequiredArgsConstructor
public class AdminWorkspaceOverviewController {
    private final AdminWorkspaceOverviewService overviewService;

    @GetMapping("/workspaces")
    public ResponseEntity<ResponseErrorTemplate> workspaces() {
        List<AdminWorkspaceOverviewResponse> summary = overviewService.listWorkspaceTotals();
        return ResponseEntity.ok(new ResponseErrorTemplate("Workspace totals", "200", summary, false));
    }
}
