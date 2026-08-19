package com.ticket.ticketservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.ticketservice.dto.TicketLockRequest;
import com.ticket.ticketservice.dto.TicketRequest;
import com.ticket.ticketservice.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/create")
    public ResponseEntity<ResponseErrorTemplate> createTicket(@Valid @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.createTicket(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping("/lock")
    public ResponseEntity<ResponseErrorTemplate> lockTicket(@Valid @RequestBody TicketLockRequest request) {
        return ResponseEntity.ok(ticketService.lockTicket(request));
    }

    @PostMapping("/unlock")
    public ResponseEntity<ResponseErrorTemplate> unlockTicket(@RequestParam Long eventId,
                                                              @RequestParam(defaultValue = "1") Integer quantity) {
        ticketService.unlockTicket(eventId, quantity);
        return ResponseEntity.ok(new ResponseErrorTemplate(
                "Tickets unlocked successfully",
                "UNLOCK_SUCCESS",
                null,
                false
        ));
    }
}