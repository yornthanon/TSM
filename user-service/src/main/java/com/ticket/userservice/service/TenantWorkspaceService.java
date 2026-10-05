package com.ticket.userservice.service;

import com.ticket.common.tenant.TenantContextHolder;
import com.ticket.userservice.dto.response.TenantWorkspaceResponse;
import com.ticket.userservice.entity.TenantWorkspace;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantWorkspaceService {
    private final TenantWorkspaceRepository workspaceRepository;

    @Transactional(readOnly = true)
    public TenantWorkspaceResponse currentWorkspace() {
        Long id = TenantContextHolder.getTenantId();
        if (id == null) throw new IllegalStateException("Select a workspace to view its settings.");
        return workspaceRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new IllegalStateException("Workspace not found."));
    }

    @Transactional(readOnly = true)
    public List<TenantWorkspaceResponse> listAll() {
        return workspaceRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TenantWorkspaceResponse updateStatus(Long id, String requestedStatus) {
        if (!StringUtils.hasText(requestedStatus)) throw new IllegalArgumentException("Status is required.");
        String status = requestedStatus.trim().toUpperCase();
        if (!List.of("ACTIVE", "SUSPENDED").contains(status)) {
            throw new IllegalArgumentException("Status must be ACTIVE or SUSPENDED.");
        }
        TenantWorkspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Workspace not found."));
        workspace.setStatus(status);
        return toResponse(workspaceRepository.save(workspace));
    }

    private TenantWorkspaceResponse toResponse(TenantWorkspace workspace) {
        return new TenantWorkspaceResponse(workspace.getId(), workspace.getName(), workspace.getStatus(),
                workspace.getOwnerUserId(), workspace.getCreatedAt());
    }
}
