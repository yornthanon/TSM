package com.ticket.ticketservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.ticketservice.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tickets")
@RequiredArgsConstructor
public class AdminTicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ApiResponse.from(ticketService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getTicketById(@PathVariable Long id) {
        return ApiResponse.from(ticketService.getTicketById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(ticketService.getStats());
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<ResponseErrorTemplate> lockTicket(@PathVariable Long id) {
        return ApiResponse.from(ticketService.lockTicketById(id));
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<ResponseErrorTemplate> unlockTicket(@PathVariable Long id) {
        return ApiResponse.from(ticketService.unlockTicketById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deleteTicket(@PathVariable Long id) {
        return ApiResponse.from(ticketService.deleteTicket(id));
    }
}
