package com.ticket.eventservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.eventservice.dto.EventResponse;
import com.ticket.eventservice.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/events")
@RequiredArgsConstructor
public class PublicEventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findPublicEvents() {
        List<EventResponse> events = eventService.findPublicEvents();
        return ApiResponse.from(new ResponseErrorTemplate(
                "Public events retrieved successfully", "PUBLIC_EVENTS_FOUND", events, false));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getPublicEventById(@PathVariable Long id) {
        EventResponse event = eventService.getPublicEventById(id);
        if (event == null) {
            return ApiResponse.from(new ResponseErrorTemplate(
                    "Event not found", "EVENT_NOT_FOUND", null, true));
        }
        return ApiResponse.from(new ResponseErrorTemplate(
                "Event retrieved successfully", "EVENT_FOUND", event, false));
    }
}
