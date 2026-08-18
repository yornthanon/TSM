package com.ticket.userservice.service.impl;

import com.ticket.common.criteria.BaseSearchCriteria;
import com.ticket.common.criteria.SearchCriteria;
import com.ticket.common.criteria.SearchOperation;
import com.ticket.common.dto.request.PageableRequestVO;
import com.ticket.common.dto.response.PageableResponseVO;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.repository.BaseRepository;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.dto.request.UserRequest;
import com.ticket.userservice.dto.response.UserResponse;
import com.ticket.userservice.entity.Group;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.exception.BasedException;
import com.ticket.userservice.repository.GroupRepository;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.UserService;
import com.ticket.userservice.service.handle.UserHandlerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final GroupRepository groupRepository;
    private final UserHandlerService userHandlerService;
    private final PasswordEncoder passwordEncoder;
    private final BaseRepository baseRepository;
    private final UserSearchServiceImpl userSearchService;

    @Transactional
    public ResponseErrorTemplate create(UserRequest userRequest) {
        if (!StringUtils.hasText(userRequest.username())) {
            throw new BasedException("VALIDATION_ERROR", "Username is required", null, "username", null);
        }

        ResponseErrorTemplate validation = userHandlerService.userRequestValidation(userRequest);
        if (validation.isError()) {
            return validation;
        }

        User user = new User();
        userHandlerService.mapUserRequestToUser(userRequest, user);
        user.setStatus("ACTIVE");
        user.setLoginAttempts(0);
        user.setMaxAttempts(5);
        assignRoles(user, userRequest.roles());
        assignGroups(user, userRequest.groupIds());

        baseRepository.saveOrUpdate(user);

        return new ResponseErrorTemplate(
                "User created successfully",
                "USER_CREATED",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate update(Long id, UserRequest userRequest) {
        User user = baseRepository.getByField("id", id, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with id: " + id, null, "id", String.valueOf(id));
        }

        userHandlerService.mapUserRequestToUser(userRequest, user);
        baseRepository.saveOrUpdate(user);

        return new ResponseErrorTemplate(
                "User updated successfully",
                "USER_UPDATED",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findById(Long id) {
        User user = baseRepository.getByField("id", id, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with id: " + id, null, "id", String.valueOf(id));
        }
        return new ResponseErrorTemplate(
                "User retrieved successfully",
                "USER_FOUND",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findAll(UserFilterRequest userFilterRequest) {
        BaseSearchCriteria criteria = new BaseSearchCriteria();
        boolean hasFilter = false;

        if (userFilterRequest.hasUsernameFilter()) {
            criteria.addCriteria(new SearchCriteria("username", userFilterRequest.getUsername(), SearchOperation.EQUAL));
            hasFilter = true;
        }
        if (userFilterRequest.hasEmailFilter()) {
            criteria.addCriteria(new SearchCriteria("email", userFilterRequest.getEmail(), SearchOperation.MATCH));
            hasFilter = true;
        }
        if (userFilterRequest.hasStatusFilter()) {
            criteria.addCriteria(new SearchCriteria("status", userFilterRequest.getStatus().toUpperCase(), SearchOperation.EQUAL));
            hasFilter = true;
        }

        PageableRequestVO pageable = PageableRequestVO.of(
                userFilterRequest.getPageNumber(),
                userFilterRequest.getPageSize(),
                userFilterRequest.getSortBy(),
                userFilterRequest.isDesc());

        PageableResponseVO<User> page = hasFilter
                ? baseRepository.listPage(User.class, criteria, pageable)
                : baseRepository.listPage(User.class, pageable);

        List<UserResponse> content = page.getContent().stream()
                .map(userHandlerService::mapUserToUserResponse)
                .toList();

        PageableResponseVO<UserResponse> pageableResponse = PageableResponseVO.of(
                content,
                page.getTotalElements(),
                page.getPageNumber(),
                page.getPageSize());

        return new ResponseErrorTemplate(
                "Users retrieved successfully",
                "USERS_FOUND",
                pageableResponse,
                false
        );
    }

    @Override
    public ResponseErrorTemplate findByUsername(String username) {
        User user = baseRepository.getByField("username", username, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with username: " + username,
                    null, "username", username);
        }
        return new ResponseErrorTemplate(
                "User retrieved successfully",
                "USER_FOUND",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findByEmail(String email) {
        User user = baseRepository.getByField("email", email, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with email: " + email,
                    null, "email", email);
        }
        return new ResponseErrorTemplate(
                "User retrieved successfully",
                "USER_FOUND",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate changePassword(Long id, String oldPassword, String newPassword) {
        User user = baseRepository.getByField("id", id, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with id: " + id, null, "id", String.valueOf(id));
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BasedException("INVALID_PASSWORD", "Old password is incorrect",
                    null, "oldPassword", null);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        baseRepository.saveOrUpdate(user);

        return new ResponseErrorTemplate(
                "Password changed successfully",
                "PASSWORD_CHANGED",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate disActivateUser(Long id) {
        User user = baseRepository.getByField("id", id, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with id: " + id, null, "id", String.valueOf(id));
        }

        user.setStatus("INACTIVE");
        baseRepository.saveOrUpdate(user);

        return new ResponseErrorTemplate(
                "User deactivated successfully",
                "USER_DEACTIVATED",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate resetPassword(Long id, String newPassword) {
        User user = baseRepository.getByField("id", id, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with id: " + id, null, "id", String.valueOf(id));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setLoginAttempts(0);
        baseRepository.saveOrUpdate(user);

        return new ResponseErrorTemplate(
                "Password reset successfully",
                "PASSWORD_RESET",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    @Transactional
    public ResponseErrorTemplate delete(Long id) {
        User user = baseRepository.getByField("id", id, User.class);
        if (user == null) {
            throw new BasedException("USER_NOT_FOUND", "User not found with id: " + id, null, "id", String.valueOf(id));
        }
        baseRepository.delete(user);
        return new ResponseErrorTemplate(
                "User deleted successfully",
                "USER_DELETED",
                null,
                false
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageableResponseVO<User> searchUsers(UserFilterRequest userFilterRequest) {
        return userSearchService.searchUsers(userFilterRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public PageableResponseVO<User> searchUseWithCriteria(BaseSearchCriteria searchCriteria, PageableRequestVO pageableRequestVO) {
        return searchUsersWithCriteria(searchCriteria, pageableRequestVO);
    }

    @Override
    @Transactional(readOnly = true)
    public PageableResponseVO<User> searchUsersWithCriteria(BaseSearchCriteria searchCriteria, PageableRequestVO pageable) {
        if (searchCriteria == null) {
            return baseRepository.listPage(User.class, pageable);
        }
        return baseRepository.listPage(User.class, searchCriteria, pageable);
    }

    private void assignRoles(User user, Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            user.addRole(roleRepository.findByName("USER")
                    .orElseThrow(() -> new BasedException("ROLE_NOT_FOUND",
                            "Default USER role not found", null, "roleNames", "USER")));
            return;
        }
        List<Role> roles = roleRepository.findAllByNameIn(roleNames);
        if (roles.size() != roleNames.size()) {
            Set<String> missing = new HashSet<>(roleNames);
            missing.removeAll(roles.stream().map(Role::getName).toList());
            throw new BasedException("ROLE_NOT_FOUND", "Roles not found: " + missing,
                    null, "roleNames", missing.toString());
        }
        roles.forEach(user::addRole);
    }

    private void assignGroups(User user, Set<Long> groupIds) {
        if (groupIds == null || groupIds.isEmpty()) {
            return;
        }
        List<Group> groups = groupRepository.findAllByIdIn(groupIds);
        if (groups.size() != groupIds.size()) {
            Set<Long> missing = new HashSet<>(groupIds);
            missing.removeAll(groups.stream().map(Group::getId).toList());
            throw new BasedException("GROUP_NOT_FOUND", "Groups not found: " + missing,
                    null, "groupIds", missing.toString());
        }
        groups.forEach(user::addGroup);
    }
}
