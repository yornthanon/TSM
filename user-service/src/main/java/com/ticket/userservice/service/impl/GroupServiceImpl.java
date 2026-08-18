package com.ticket.userservice.service.impl;

import com.ticket.common.criteria.BaseSearchCriteria;
import com.ticket.common.criteria.SearchCriteria;
import com.ticket.common.criteria.SearchOperation;
import com.ticket.common.dto.request.PageableRequestVO;
import com.ticket.common.dto.response.PageableResponseVO;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.repository.BaseRepository;
import com.ticket.userservice.dto.request.GroupFilterRequest;
import com.ticket.userservice.dto.request.GroupRequest;
import com.ticket.userservice.dto.response.GroupMemberResponse;
import com.ticket.userservice.dto.response.GroupResponse;
import com.ticket.userservice.entity.Group;
import com.ticket.userservice.entity.Permission;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.exception.GroupValidationException;
import com.ticket.userservice.repository.PermissionRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.GroupService;
import com.ticket.userservice.service.handle.GroupHandlerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private final BaseRepository baseRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final GroupHandlerService groupHandlerService;

    public GroupServiceImpl(BaseRepository baseRepository,
                            UserRepository userRepository,
                            PermissionRepository permissionRepository,
                            RoleRepository roleRepository,
                            GroupHandlerService groupHandlerService) {
        this.baseRepository = baseRepository;
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.groupHandlerService = groupHandlerService;
    }

    @Override
    @Transactional
    public ResponseErrorTemplate create(GroupRequest request) {
        ResponseErrorTemplate validation = groupHandlerService.groupRequestValidation(request);
        if (validation != null && validation.isError()) {
            return validation;
        }

        if (baseRepository.getByField("name", request.name(), Group.class) != null) {
            throw new GroupValidationException("name", "Group already exists: " + request.name());
        }

        Group group = groupHandlerService.convertGroupRequestToGroup(request, new Group());
        resolveAssociations(request, group);
        baseRepository.saveOrUpdate(group);

        return new ResponseErrorTemplate(
                "Group created successfully",
                "GROUP_CREATED",
                groupHandlerService.convertGroupToGroupResponse(group),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate update(Long id, GroupRequest request) {
        Group group = baseRepository.getByField("id", id, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + id,
                    null,
                    "id",
                    String.valueOf(id)
            );
        }

        ResponseErrorTemplate validation = groupHandlerService.groupRequestValidation(request);
        if (validation != null && validation.isError()) {
            return validation;
        }

        if (!group.getName().equals(request.name())
                && baseRepository.getByField("name", request.name(), Group.class) != null) {
            throw new GroupValidationException("name", "Group already exists: " + request.name());
        }

        groupHandlerService.convertGroupRequestToGroup(request, group);
        resolveAssociations(request, group);
        baseRepository.saveOrUpdate(group);

        return new ResponseErrorTemplate(
                "Group updated successfully",
                "GROUP_UPDATED",
                groupHandlerService.convertGroupToGroupResponse(group),
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseErrorTemplate findById(Long id) {
        Group group = baseRepository.getByField("id", id, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + id,
                    null,
                    "id",
                    String.valueOf(id)
            );
        }
        return new ResponseErrorTemplate(
                "Group retrieved successfully",
                "GROUP_FOUND",
                groupHandlerService.convertGroupToGroupResponse(group),
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseErrorTemplate findAll(GroupFilterRequest filterRequest) {
        BaseSearchCriteria criteria = new BaseSearchCriteria();
        boolean hasFilter = false;

        if (filterRequest.hasId()) {
            criteria.addCriteria(new SearchCriteria("id", filterRequest.getId(), SearchOperation.EQUAL));
            hasFilter = true;
        }
        if (filterRequest.hasName()) {
            criteria.addCriteria(new SearchCriteria("name", filterRequest.getName(), SearchOperation.MATCH));
            hasFilter = true;
        }
        if (filterRequest.hasStatus()) {
            criteria.addCriteria(new SearchCriteria("status", filterRequest.getStatus().toUpperCase(), SearchOperation.EQUAL));
            hasFilter = true;
        }

        PageableRequestVO pageable = PageableRequestVO.of(
                filterRequest.getPageNumber(),
                filterRequest.getPageSize(),
                filterRequest.getSortBy(),
                filterRequest.isDesc());

        PageableResponseVO<Group> page = hasFilter
                ? baseRepository.listPage(Group.class, criteria, pageable)
                : baseRepository.listPage(Group.class, pageable);

        List<GroupResponse> content = page.getContent().stream()
                .map(groupHandlerService::convertGroupToGroupResponse)
                .toList();

        PageableResponseVO<GroupResponse> response = PageableResponseVO.of(
                content,
                page.getTotalElements(),
                page.getPageNumber(),
                page.getPageSize());

        return new ResponseErrorTemplate(
                "Groups retrieved successfully",
                "GROUPS_FOUND",
                response,
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseErrorTemplate getMembers(Long groupId) {
        Group group = baseRepository.getByField("id", groupId, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + groupId,
                    null,
                    "groupId",
                    String.valueOf(groupId)
            );
        }
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
        Group group = baseRepository.getByField("id", groupId, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + groupId,
                    null,
                    "groupId",
                    String.valueOf(groupId)
            );
        }

        User user = baseRepository.getByField("id", userId, User.class);
        if (user == null) {
            throw new BasedException(
                    "USER_NOT_FOUND",
                    "User not found with id: " + userId,
                    null,
                    "userId",
                    String.valueOf(userId)
            );
        }

        if (group.getUsers().contains(user)) {
            throw new BasedException("USER_ALREADY_IN_GROUP", "User already in group", null, "userId", String.valueOf(userId));
        }

        user.getGroups().add(group);
        userRepository.save(user);

        return new ResponseErrorTemplate(
                "Member added successfully",
                "MEMBER_ADDED",
                groupHandlerService.convertGroupToGroupResponse(group),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate deleteMember(Long groupId, Long userId) {
        Group group = baseRepository.getByField("id", groupId, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + groupId,
                    null,
                    "groupId",
                    String.valueOf(groupId)
            );
        }

        User user = baseRepository.getByField("id", userId, User.class);
        if (user == null) {
            throw new BasedException(
                    "USER_NOT_FOUND",
                    "User not found with id: " + userId,
                    null,
                    "userId",
                    String.valueOf(userId)
            );
        }

        if (!group.getUsers().contains(user)) {
            throw new BasedException("USER_NOT_IN_GROUP", "User not in group", null, "userId", String.valueOf(userId));
        }

        user.getGroups().remove(group);
        userRepository.save(user);

        return new ResponseErrorTemplate(
                "Member removed successfully",
                "MEMBER_REMOVED",
                groupHandlerService.convertGroupToGroupResponse(group),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate addPermission(Long groupId, Long permissionId) {
        Group group = baseRepository.getByField("id", groupId, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + groupId,
                    null,
                    "groupId",
                    String.valueOf(groupId)
            );
        }

        Permission permission = baseRepository.getByField("id", permissionId, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with id: " + permissionId,
                    null,
                    "permissionId",
                    String.valueOf(permissionId)
            );
        }

        if (group.getPermissions().contains(permission)) {
            throw new BasedException("PERMISSION_ALREADY_IN_GROUP", "Permission already in group", null, "permissionId", String.valueOf(permissionId));
        }

        group.getPermissions().add(permission);
        baseRepository.saveOrUpdate(group);

        return new ResponseErrorTemplate(
                "Permission added successfully",
                "PERMISSION_ADDED",
                groupHandlerService.convertGroupToGroupResponse(group),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate removePermission(Long groupId, Long permissionId) {
        Group group = baseRepository.getByField("id", groupId, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + groupId,
                    null,
                    "groupId",
                    String.valueOf(groupId)
            );
        }

        Permission permission = baseRepository.getByField("id", permissionId, Permission.class);
        if (permission == null) {
            throw new BasedException(
                    "PERMISSION_NOT_FOUND",
                    "Permission not found with id: " + permissionId,
                    null,
                    "permissionId",
                    String.valueOf(permissionId)
            );
        }

        if (!group.getPermissions().contains(permission)) {
            throw new BasedException("PERMISSION_NOT_IN_GROUP", "Permission not in group", null, "permissionId", String.valueOf(permissionId));
        }

        group.getPermissions().remove(permission);
        baseRepository.saveOrUpdate(group);

        return new ResponseErrorTemplate(
                "Permission removed successfully",
                "PERMISSION_REMOVED",
                groupHandlerService.convertGroupToGroupResponse(group),
                false
        );
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Group group = baseRepository.getByField("id", id, Group.class);
        if (group == null) {
            throw new BasedException(
                    "GROUP_NOT_FOUND",
                    "Group not found with id: " + id,
                    null,
                    "id",
                    String.valueOf(id)
            );
        }
        baseRepository.delete(group);
    }

    private void resolveAssociations(GroupRequest request, Group group) {
        if (request.roleNames() != null && !request.roleNames().isEmpty()) {
            List<Role> roles = roleRepository.findAllByNameIn(request.roleNames());
            group.setRoles(new HashSet<>(roles));
        }
        if (request.permissionNames() != null && !request.permissionNames().isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllByNameIn(request.permissionNames());
            group.setPermissions(new HashSet<>(permissions));
        }
    }
}