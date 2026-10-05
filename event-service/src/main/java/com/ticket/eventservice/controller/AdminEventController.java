package com.ticket.eventservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.eventservice.dto.EventRequest;
import com.ticket.eventservice.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ApiResponse.from(eventService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getById(@PathVariable Long id) {
        return ApiResponse.from(eventService.getById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(eventService.getStats());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> update(@PathVariable Long id,
                                                        @Valid @RequestBody EventRequest request) {
        return ApiResponse.from(eventService.update(id, request));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ResponseErrorTemplate> approve(@PathVariable Long id) {
        return ApiResponse.from(eventService.updateStatus(id, "APPROVED"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ResponseErrorTemplate> reject(@PathVariable Long id) {
        return ApiResponse.from(eventService.updateStatus(id, "REJECTED"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ApiResponse.from(new ResponseErrorTemplate(
                "Event deleted successfully", "200", null, false));
    }
}
