package com.ticket.userservice.service.impl;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreateGroupRequestDTO;
import com.ticket.userservice.dto.response.CreateGroupResponseDTO;
import com.ticket.userservice.dto.response.GroupMemberResponse;
import com.ticket.userservice.entity.Group;
import com.ticket.userservice.entity.Permission;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.repository.GroupRepository;
import com.ticket.userservice.repository.PermissionRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.GroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    public ResponseErrorTemplate create(CreateGroupRequestDTO createGroupRequestDTO) {
        if (!StringUtils.hasText(createGroupRequestDTO.getName())) {
            throw new BasedException("GROUP_NAME_REQUIRED", "Group name is required", null, "name", null);
        }
        if (groupRepository.findByName(createGroupRequestDTO.getName()).isPresent()) {
            throw new BasedException("GROUP_ALREADY_EXISTS", "Group already exists: " + createGroupRequestDTO.getName(), null, "name", createGroupRequestDTO.getName());
        }

        Group group = new Group();
        group.setName(createGroupRequestDTO.getName());
        group.setDescription(createGroupRequestDTO.getDescription());
        group.setStatus(createGroupRequestDTO.getStatus());

        if (createGroupRequestDTO.getRoleNames() != null && !createGroupRequestDTO.getRoleNames().isEmpty()) {
            List<Role> roles = roleRepository.findAllByNameIn(createGroupRequestDTO.getRoleNames());
            group.setRoles(new HashSet<>(roles));
        }
        if (createGroupRequestDTO.getPermissionNames() != null && !createGroupRequestDTO.getPermissionNames().isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllByNameIn(createGroupRequestDTO.getPermissionNames());
            group.setPermissions(new HashSet<>(permissions));
        }

        groupRepository.save(group);

        return new ResponseErrorTemplate(
                "Group created successfully",
                "GROUP_CREATED",
                CreateGroupResponseDTO.from(group),
                false
        );
    }

    @Override
    public ResponseErrorTemplate update(Long id, CreateGroupRequestDTO createGroupRequestDTO) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + id, null, "id", String.valueOf(id)));

        group.setName(createGroupRequestDTO.getName());
        group.setDescription(createGroupRequestDTO.getDescription());
        group.setStatus(createGroupRequestDTO.getStatus());

        if (createGroupRequestDTO.getRoleNames() != null && !createGroupRequestDTO.getRoleNames().isEmpty()) {
            List<Role> roles = roleRepository.findAllByNameIn(createGroupRequestDTO.getRoleNames());
            group.setRoles(new HashSet<>(roles));
        }
        if (createGroupRequestDTO.getPermissionNames() != null && !createGroupRequestDTO.getPermissionNames().isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllByNameIn(createGroupRequestDTO.getPermissionNames());
            group.setPermissions(new HashSet<>(permissions));
        }

        groupRepository.save(group);

        return new ResponseErrorTemplate(
                "Group updated successfully",
                "GROUP_UPDATED",
                CreateGroupResponseDTO.from(group),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findById(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + id, null, "id", String.valueOf(id)));
        return new ResponseErrorTemplate(
                "Group retrieved successfully",
                "GROUP_FOUND",
                CreateGroupResponseDTO.from(group),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findAll(Pageable pageable) {
        Page<CreateGroupResponseDTO> page = groupRepository.findAll(pageable).map(CreateGroupResponseDTO::from);
        return new ResponseErrorTemplate(
                "Groups retrieved successfully",
                "GROUPS_FOUND",
                page,
                false
        );
    }

    @Override
    public ResponseErrorTemplate getMembers(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + groupId, null, "groupId", String.valueOf(groupId)));
        List<GroupMemberResponse> members = group.getUsers().stream()
                .map(GroupMemberResponse::from)
                .collect(Collectors.toList());
        return new ResponseErrorTemplate(
                "Members retrieved successfully",
                "GROUP_MEMBERS_FOUND",
                members,
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate addMember(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + groupId, null, "groupId", String.valueOf(groupId)));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BasedException("USER_NOT_FOUND", "User not found with id: " + userId, null, "userId", String.valueOf(userId)));

        if (group.getUsers().contains(user)) {
            throw new BasedException("USER_ALREADY_IN_GROUP", "User already in group", null, "userId", String.valueOf(userId));
        }

        user.getGroups().add(group);
        userRepository.save(user);

        return new ResponseErrorTemplate(
                "Member added successfully",
                "MEMBER_ADDED",
                CreateGroupResponseDTO.from(group),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate deleteMember(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + groupId, null, "groupId", String.valueOf(groupId)));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BasedException("USER_NOT_FOUND", "User not found with id: " + userId, null, "userId", String.valueOf(userId)));

        if (!group.getUsers().contains(user)) {
            throw new BasedException("USER_NOT_IN_GROUP", "User not in group", null, "userId", String.valueOf(userId));
        }

        user.getGroups().remove(group);
        userRepository.save(user);

        return new ResponseErrorTemplate(
                "Member removed successfully",
                "MEMBER_REMOVED",
                CreateGroupResponseDTO.from(group),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate addPermission(Long groupId, Long permissionId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + groupId, null, "groupId", String.valueOf(groupId)));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with id: " + permissionId, null, "permissionId", String.valueOf(permissionId)));

        if (group.getPermissions().contains(permission)) {
            throw new BasedException("PERMISSION_ALREADY_IN_GROUP", "Permission already in group", null, "permissionId", String.valueOf(permissionId));
        }

        group.getPermissions().add(permission);
        groupRepository.save(group);

        return new ResponseErrorTemplate(
                "Permission added successfully",
                "PERMISSION_ADDED",
                CreateGroupResponseDTO.from(group),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate removePermission(Long groupId, Long permissionId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + groupId, null, "groupId", String.valueOf(groupId)));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new BasedException("PERMISSION_NOT_FOUND", "Permission not found with id: " + permissionId, null, "permissionId", String.valueOf(permissionId)));

        if (!group.getPermissions().contains(permission)) {
            throw new BasedException("PERMISSION_NOT_IN_GROUP", "Permission not in group", null, "permissionId", String.valueOf(permissionId));
        }

        group.getPermissions().remove(permission);
        groupRepository.save(group);

        return new ResponseErrorTemplate(
                "Permission removed successfully",
                "PERMISSION_REMOVED",
                CreateGroupResponseDTO.from(group),
                false
        );
    }

    @Override
    public void delete(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new BasedException("GROUP_NOT_FOUND", "Group not found with id: " + id, null, "id", String.valueOf(id)));
        groupRepository.delete(group);
    }
}
