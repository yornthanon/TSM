package com.ticket.ticketservice.controller;

import com.ticket.common.exception.ApiResponse;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.ticketservice.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/events")
@RequiredArgsConstructor
public class PublicTicketController {

    private final TicketService ticketService;

    @GetMapping("/{eventId}/tickets")
    public ResponseEntity<ResponseErrorTemplate> findPublicTickets(
            @PathVariable Long eventId,
            @RequestParam(required = false) Long tenantId) {
        return ApiResponse.from(ticketService.findPublicTickets(eventId, tenantId));
    }
}
