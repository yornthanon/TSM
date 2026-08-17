package com.ticket.userservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.userservice.dto.request.CreateGroupRequestDTO;
import com.ticket.userservice.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/create")
    public ResponseEntity<ResponseErrorTemplate> createGroup(@Valid @RequestBody CreateGroupRequestDTO createGroupRequestDTO) {
        return ResponseEntity.ok(groupService.create(createGroupRequestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updateGroup(@PathVariable Long id, @Valid @RequestBody CreateGroupRequestDTO createGroupRequestDTO) {
        return ResponseEntity.ok(groupService.update(id, createGroupRequestDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.findById(id));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> getAllGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(groupService.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<ResponseErrorTemplate> getMembers(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getMembers(groupId));
    }

    @PostMapping("/{groupId}/members/{userId}")
    public ResponseEntity<ResponseErrorTemplate> addMember(@PathVariable Long groupId, @PathVariable Long userId) {
        return ResponseEntity.ok(groupService.addMember(groupId, userId));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<ResponseErrorTemplate> deleteMember(@PathVariable Long groupId, @PathVariable Long userId) {
        return ResponseEntity.ok(groupService.deleteMember(groupId, userId));
    }

    @PostMapping("/{groupId}/permissions/{permissionId}")
    public ResponseEntity<ResponseErrorTemplate> addPermission(@PathVariable Long groupId, @PathVariable Long permissionId) {
        return ResponseEntity.ok(groupService.addPermission(groupId, permissionId));
    }

    @DeleteMapping("/{groupId}/permissions/{permissionId}")
    public ResponseEntity<ResponseErrorTemplate> removePermission(@PathVariable Long groupId, @PathVariable Long permissionId) {
        return ResponseEntity.ok(groupService.removePermission(groupId, permissionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deleteGroup(@PathVariable Long id) {
        groupService.delete(id);
        return ResponseEntity.ok(new ResponseErrorTemplate(
                "Group deleted successfully",
                "GROUP_DELETED",
                null,
                false
        ));
    }
}
