package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.dto.request.UserRequest;
import com.ticket.userservice.dto.response.UserProfileResponse;
import com.ticket.userservice.entity.User;
import com.ticket.userservice.repository.UserRepository;
import com.ticket.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseErrorTemplate> getCurrentUser(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName());
        if (user == null) throw new org.springframework.security.core.userdetails.UsernameNotFoundException(
                "Authenticated account was not found.");
        var roles = authentication.getAuthorities().stream().map(authority -> authority.getAuthority()).toList();
        var groups = user.getGroups().stream().map(group -> group.getName()).toList();
        UserProfileResponse profile = new UserProfileResponse(user.getId(), user.getUsername(), user.getFirstName(),
                user.getLastName(), user.getUserImg(), user.getEmail(), user.getUserType(), user.getGender(),
                user.getDateOfBirth(), user.getPhoneNumber(), user.getStatus(), roles, groups, user.getTenantId(),
                Boolean.TRUE.equals(user.getMfaEnabled()), user.getCreatedAt(), user.getUpdatedAt());
        return ApiResponse.from(new ResponseErrorTemplate("Profile retrieved successfully", "USER_PROFILE_FOUND",
                profile, false));
    }

    @PostMapping({"", "/create"})
    public ResponseEntity<ResponseErrorTemplate> createUser(@Valid @RequestBody UserRequest userRequest) {
        return ApiResponse.from(userService.create(userRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest userRequest) {
        return ApiResponse.from(userService.update(id, userRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getUserById(@PathVariable Long id) {
        return ApiResponse.from(userService.findById(id));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ResponseErrorTemplate> getUserByUsername(@PathVariable String username) {
        return ApiResponse.from(userService.findByUsername(username));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ResponseErrorTemplate> getUserByEmail(@PathVariable String email) {
        return ApiResponse.from(userService.findByEmail(email));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> getAllUsers(@Valid @ModelAttribute UserFilterRequest userFilterRequest) {
        return ApiResponse.from(userService.findAll(userFilterRequest));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(userService.getStats());
    }

    @GetMapping("/search")
    public ResponseEntity<ResponseErrorTemplate> searchUsers(@Valid @ModelAttribute UserFilterRequest userFilterRequest) {
        return ApiResponse.from(new ResponseErrorTemplate(
                "Users search successful",
                "USERS_FOUND",
                userService.searchUsers(userFilterRequest),
                false
        ));
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<ResponseErrorTemplate> changePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        return ApiResponse.from(userService.changePassword(id, oldPassword, newPassword));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ResponseErrorTemplate> disActivateUser(@PathVariable Long id) {
        return ApiResponse.from(userService.disActivateUser(id));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ResponseErrorTemplate> activateUser(@PathVariable Long id) {
        return ApiResponse.from(userService.activateUser(id));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ResponseErrorTemplate> resetPassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {
        return ApiResponse.from(userService.resetPassword(id, newPassword));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deleteUser(@PathVariable Long id) {
        return ApiResponse.from(userService.delete(id));
    }
}
