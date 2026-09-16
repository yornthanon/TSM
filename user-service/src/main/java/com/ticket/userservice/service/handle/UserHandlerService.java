package com.ticket.userservice.service.handle;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.UserRequest;
import com.ticket.userservice.dto.response.UserResponse;
import com.ticket.userservice.entity.Role;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.RoleRepository;
import com.ticket.userservice.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserHandlerService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserHandlerService(PasswordEncoder passwordEncoder,
                              UserRepository userRepository,
                              RoleRepository roleRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public ResponseErrorTemplate userRequestValidation(UserRequest userRequest) {
        if (ObjectUtils.isEmpty(userRequest.password())) {
            return new ResponseErrorTemplate(
                    "Password can't be blank or null.",
                    String.valueOf(HttpStatus.BAD_REQUEST.value()),
                    null, true);
        }

        Optional<User> user = userRepository.findByUsernameOrEmail(userRequest.username(), userRequest.email());
        if (user.isPresent()) {
            return new ResponseErrorTemplate(
                    "Username or Email already exists.",
                    String.valueOf(HttpStatus.BAD_REQUEST.value()),
                    null, true);
        }

        if (userRequest.roles() != null) {
            List<String> roles = roleRepository.findAll().stream().map(Role::getName).toList();
            for (var role : userRequest.roles()) {
                if (!roles.contains(role)) {
                    return new ResponseErrorTemplate(
                            "Role is invalid request: " + role,
                            String.valueOf(HttpStatus.BAD_REQUEST.value()),
                            null, true);
                }
            }
        }

        return new ResponseErrorTemplate(
                "Validation successful",
                String.valueOf(HttpStatus.OK.value()),
                null, false);
    }

    public User mapUserRequestToUser(final UserRequest userRequest, User user) {
        user.setUsername(userRequest.username());
        user.setFirstName(userRequest.firstName());
        user.setLastName(userRequest.lastName());
        user.setUserImg(userRequest.userImg());
        user.setUserType(userRequest.userType());
        if (userRequest.password() != null && !userRequest.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(userRequest.password()));
        }
        user.setEmail(userRequest.email());
        user.setGender(userRequest.gender());
        user.setDateOfBirth(userRequest.dateOfBirth());
        user.setPhoneNumber(userRequest.phoneNumber());
        user.setEnableAllocate(userRequest.enableAllocate());
        user.setStatus(userRequest.status());
        return user;
    }

    public UserResponse mapUserToUserResponse(final User user) {
        Set<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
                : Set.of();

        Set<String> groupNames = user.getGroups() != null
                ? user.getGroups().stream().map(g -> g.getName()).collect(Collectors.toSet())
                : Set.of();

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getUserImg(),
                user.getEmail(),
                user.getUserType(),
                user.getGender(),
                user.getDateOfBirth(),
                user.getLastLogin() != null ? user.getLastLogin().toString() : null,
                user.getLoginAttempts(),
                user.getMaxAttempts(),
                user.getEnableAllocate(),
                user.getPhoneNumber(),
                user.getStatus(),
                roleNames,
                groupNames,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
