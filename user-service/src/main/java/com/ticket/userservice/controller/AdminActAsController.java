package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.userservice.dto.response.ActAsAuditResponse;
import com.ticket.userservice.dto.response.ActAsResponse;
import com.ticket.userservice.service.AdminActAsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/act-as")
@RequiredArgsConstructor
public class AdminActAsController {
    private final AdminActAsService adminActAsService;

    @PostMapping("/users/{userId}")
    public ResponseEntity<ResponseErrorTemplate> start(@PathVariable Long userId, Authentication authentication) {
        ActAsResponse response = adminActAsService.start(userId, authentication);
        return ApiResponse.from(new ResponseErrorTemplate("Act-as session started", "200", response, false));
    }

    @PostMapping("/{sessionId}/stop")
    public ResponseEntity<ResponseErrorTemplate> stop(@PathVariable Long sessionId, Authentication authentication) {
        adminActAsService.stop(sessionId, authentication);
        return ApiResponse.from(new ResponseErrorTemplate("Act-as session stopped", "200", null, false));
    }

    @GetMapping("/audit")
    public ResponseEntity<ResponseErrorTemplate> audit(Authentication authentication) {
        List<ActAsAuditResponse> rows = adminActAsService.recentAudit(authentication);
        return ApiResponse.from(new ResponseErrorTemplate("Act-as audit", "200", rows, false));
    }
}
