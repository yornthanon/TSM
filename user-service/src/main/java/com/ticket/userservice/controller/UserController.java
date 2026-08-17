package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.UserFilterRequest;
import com.ticket.userservice.dto.request.UserRequest;
import com.ticket.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseErrorTemplate> createUser(@Valid @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(userService.create(userRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(userService.update(id, userRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ResponseErrorTemplate> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.findByUsername(username));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ResponseErrorTemplate> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> getAllUsers(@Valid @ModelAttribute UserFilterRequest userFilterRequest) {
        return ResponseEntity.ok(userService.findAll(userFilterRequest));
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<ResponseErrorTemplate> changePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        return ResponseEntity.ok(userService.changePassword(id, oldPassword, newPassword));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ResponseErrorTemplate> disActivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.disActivateUser(id));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ResponseErrorTemplate> resetPassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {
        return ResponseEntity.ok(userService.resetPassword(id, newPassword));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.delete(id));
    }
}
