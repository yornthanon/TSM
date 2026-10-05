package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.dto.request.UserRequest;
import com.ticket.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> getAllUsers(@Valid @ModelAttribute UserFilterRequest filterRequest) {
        return ApiResponse.from(userService.findAll(filterRequest));
    }

    @PostMapping
    public ResponseEntity<ResponseErrorTemplate> createUser(@Valid @RequestBody UserRequest userRequest) {
        return ApiResponse.from(userService.create(userRequest));
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

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updateUser(@PathVariable Long id,
                                                           @Valid @RequestBody UserRequest userRequest) {
        return ApiResponse.from(userService.update(id, userRequest));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ResponseErrorTemplate> activateUser(@PathVariable Long id) {
        return ApiResponse.from(userService.activateUser(id));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ResponseErrorTemplate> deactivateUser(@PathVariable Long id) {
        return ApiResponse.from(userService.disActivateUser(id));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ResponseErrorTemplate> resetPassword(@PathVariable Long id,
                                                               @RequestParam String newPassword) {
        return ApiResponse.from(userService.resetPassword(id, newPassword));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deleteUser(@PathVariable Long id) {
        return ApiResponse.from(userService.delete(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(userService.getStats());
    }
}
