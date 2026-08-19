package com.ticket.eventservice.controller;

import com.ticket.eventservice.dto.EventRequest;
import com.ticket.eventservice.dto.ResponseErrorTemplate;
import com.ticket.eventservice.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping("/create")
    public ResponseEntity<ResponseErrorTemplate> create(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> update(@PathVariable Long id,
                                                       @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(eventService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(new ResponseErrorTemplate(
                "Event deleted successfully",
                "200",
                null,
                false));
    }
}