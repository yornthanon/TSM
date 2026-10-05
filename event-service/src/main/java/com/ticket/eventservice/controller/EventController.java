package com.ticket.eventservice.controller;

import com.ticket.eventservice.dto.EventRequest;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.eventservice.service.EventService;
import com.ticket.eventservice.service.EventImageStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;
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
    private final EventImageStorageService eventImageStorageService;

    @PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseErrorTemplate> uploadPhoto(@RequestParam(value = "file", required = false) MultipartFile file) {
        String imageUrl = eventImageStorageService.upload(file);
        return ResponseEntity.ok(new ResponseErrorTemplate("Event photo uploaded", "200", imageUrl, false));
    }

    @PostMapping({"", "/create"})
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

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ResponseEntity.ok(eventService.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ResponseEntity.ok(eventService.getStats());
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
