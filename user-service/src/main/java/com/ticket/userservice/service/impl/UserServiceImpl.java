package com.ticket.userservice.service.impl;

import com.ticket.common.criteria.BaseSearchCriteria;
import com.ticket.common.dto.PageableRequestVO;
import com.ticket.common.dto.PageableResponseVO;
import com.ticket.common.exception.ResponseErrorTemplate;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

        userRepository.save(user);

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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "USER_NOT_FOUND",
                        "User not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));

        userHandlerService.mapUserRequestToUser(userRequest, user);
        userRepository.save(user);

        return new ResponseErrorTemplate(
                "User updated successfully",
                "USER_UPDATED",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "USER_NOT_FOUND",
                        "User not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));
        return new ResponseErrorTemplate(
                "User retrieved successfully",
                "USER_FOUND",
                userHandlerService.mapUserToUserResponse(user),
                false
        );
    }

    @Override
    public ResponseErrorTemplate findAll(UserFilterRequest userFilterRequest) {
        Page<UserResponse> page = userRepository.findAll(
                        PageRequest.of(userFilterRequest.getPageNumber(), userFilterRequest.getPageSize(), userFilterRequest.getSort()))
                .map(userHandlerService::mapUserToUserResponse);

        PageableResponseVO<UserResponse> pageableResponse = PageableResponseVO.of(
                page.getContent(),
                (int) page.getTotalElements(),
                userFilterRequest.getPageNumber(),
                userFilterRequest.getPageSize());

        return new ResponseErrorTemplate(
                "Users retrieved successfully",
                "USERS_FOUND",
                pageableResponse,
                false
        );
    }

    @Override
    public ResponseErrorTemplate findByUsername(String username) {
        User user = userRepository.findByUsername(username);
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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BasedException("USER_NOT_FOUND", "User not found with email: " + email,
                        null, "email", email));
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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "USER_NOT_FOUND",
                        "User not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BasedException("INVALID_PASSWORD", "Old password is incorrect",
                    null, "oldPassword", null);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "USER_NOT_FOUND",
                        "User not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));

        user.setStatus("INACTIVE");
        userRepository.save(user);

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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "USER_NOT_FOUND",
                        "User not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setLoginAttempts(0);
        userRepository.save(user);

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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BasedException(
                        "USER_NOT_FOUND",
                        "User not found with id: " + id,
                        null,
                        "id",
                        String.valueOf(id)
                ));
        userRepository.delete(user);
        return new ResponseErrorTemplate(
                "User deleted successfully",
                "USER_DELETED",
                null,
                false
        );
    }

    @Override
    public PageableResponseVO<User> searchUsers(UserFilterRequest userFilterRequest) {
        return null;
    }

    @Override
    public PageableResponseVO<User> searchUseWithCriteria(BaseSearchCriteria searchCriteria, PageableRequestVO pageableRequestVO) {
        return null;
    }

    @Override
    public PageableResponseVO<User> searchUsersWithCriteria(BaseSearchCriteria searchCriteria, PageableRequestVO pageable) {
        return null;
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
