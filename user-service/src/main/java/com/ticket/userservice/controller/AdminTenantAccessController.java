package com.ticket.userservice.controller;

import com.ticket.common.exception.ApiResponse;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.entity.TenantAccessGrant;
import com.ticket.userservice.repository.TenantAccessGrantRepository;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/access-grants")
@RequiredArgsConstructor
public class AdminTenantAccessController {
    private final TenantAccessGrantRepository grantRepository;
    private final UserRepository userRepository;
    private final TenantWorkspaceRepository workspaceRepository;

    @GetMapping("/users/{userId}")
    public ResponseEntity<ResponseErrorTemplate> list(@PathVariable Long userId) {
        return ApiResponse.from(new ResponseErrorTemplate(
                "Access grants retrieved successfully", "ACCESS_GRANTS_FOUND",
                grantRepository.findTenantIdsByGranteeUserId(userId), false));
    }

    @PostMapping("/users/{userId}/workspaces/{tenantId}")
    @Transactional
    public ResponseEntity<ResponseErrorTemplate> grant(
            @PathVariable Long userId,
            @PathVariable Long tenantId,
            Authentication authentication) {
        if (!userRepository.existsById(userId) || !workspaceRepository.existsById(tenantId)) {
            return ApiResponse.from(new ResponseErrorTemplate(
                    "The user or workspace was not found", "ACCESS_GRANT_TARGET_NOT_FOUND", null, true));
        }
        List<Long> current = grantRepository.findTenantIdsByGranteeUserId(userId);
        if (!current.contains(tenantId)) {
            var actor = userRepository.findByUsername(authentication.getName());
            grantRepository.save(new TenantAccessGrant(userId, tenantId, actor == null ? null : actor.getId()));
        }
        return ApiResponse.from(new ResponseErrorTemplate(
                "Workspace access granted. The user must sign in again to receive the new access claim.",
                "ACCESS_GRANT_CREATED", grantRepository.findTenantIdsByGranteeUserId(userId), false));
    }

    @DeleteMapping("/users/{userId}/workspaces/{tenantId}")
    @Transactional
    public ResponseEntity<ResponseErrorTemplate> revoke(
            @PathVariable Long userId,
            @PathVariable Long tenantId) {
        grantRepository.deleteByGranteeUserIdAndTenantId(userId, tenantId);
        return ApiResponse.from(new ResponseErrorTemplate(
                "Workspace access revoked. The user must sign in again for the change to take effect.",
                "ACCESS_GRANT_REVOKED", grantRepository.findTenantIdsByGranteeUserId(userId), false));
    }
}
