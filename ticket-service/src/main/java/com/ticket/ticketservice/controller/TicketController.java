package com.ticket.ticketservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.common.constant.ApiConstant;
import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.ticketservice.dto.TicketLockRequest;
import com.ticket.ticketservice.dto.TicketRequest;
import com.ticket.ticketservice.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final InternalTokenProvider internalTokenProvider;

    @PostMapping({"", "/create"})
    public ResponseEntity<ResponseErrorTemplate> createTicket(@Valid @RequestBody TicketRequest request) {
        return ApiResponse.from(ticketService.createTicket(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getTicketById(@PathVariable Long id) {
        return ApiResponse.from(ticketService.getTicketById(id));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ApiResponse.from(ticketService.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(ticketService.getStats());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> updateTicket(@PathVariable Long id,
                                                              @Valid @RequestBody TicketRequest ticketRequest) {
        return ApiResponse.from(ticketService.updateTicket(id, ticketRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> deleteTicket(@PathVariable Long id) {
        return ApiResponse.from(ticketService.deleteTicket(id));
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<ResponseErrorTemplate> lockTicketById(@PathVariable Long id,
                                                                @RequestBody(required = false) TicketLockRequest request) {
        return ApiResponse.from(ticketService.lockTicketById(id));
    }

    @DeleteMapping("/{id}/lock")
    public ResponseEntity<ResponseErrorTemplate> releaseLockById(@PathVariable Long id) {
        return ApiResponse.from(ticketService.unlockTicketById(id));
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<ResponseErrorTemplate> unlockTicket(@PathVariable Long id) {
        return ApiResponse.from(ticketService.unlockTicketById(id));
    }

    @PostMapping("/lock")
    public ResponseEntity<ResponseErrorTemplate> lockTicket(@Valid @RequestBody TicketLockRequest request) {
        return ApiResponse.from(ticketService.lockTicket(request));
    }

    @PostMapping("/unlock")
    public ResponseEntity<ResponseErrorTemplate> unlockTicket(@RequestParam Long eventId,
                                                              @RequestParam(defaultValue = "1") Integer quantity) {
        ticketService.unlockTicket(eventId, quantity);
        return ApiResponse.from(new ResponseErrorTemplate(
                "Tickets unlocked successfully",
                "UNLOCK_SUCCESS",
                null,
                false
        ));
    }

    @PostMapping("/internal/{id}/reserve")
    public ResponseEntity<ResponseErrorTemplate> reserve(@PathVariable Long id,
                                                         @RequestParam Integer quantity,
                                                         @RequestParam String username,
                                                         @RequestParam(defaultValue = "15") Integer durationMinutes,
                                                         @RequestHeader(name = InternalTokenProvider.INTERNAL_TOKEN_HEADER, required = false) String token) {
        if (!internalTokenProvider.getToken().equals(token)) return unauthorized();
        return ApiResponse.from(ticketService.reserveTicket(id, quantity, username, durationMinutes));
    }

    @PostMapping("/internal/{id}/confirm")
    public ResponseEntity<ResponseErrorTemplate> confirm(@PathVariable Long id,
                                                         @RequestParam String username,
                                                         @RequestHeader(name = InternalTokenProvider.INTERNAL_TOKEN_HEADER, required = false) String token) {
        if (!internalTokenProvider.getToken().equals(token)) return unauthorized();
        return ApiResponse.from(ticketService.confirmSale(id, username));
    }

    @PostMapping("/internal/{id}/release")
    public ResponseEntity<ResponseErrorTemplate> release(@PathVariable Long id,
                                                         @RequestParam String username,
                                                         @RequestHeader(name = InternalTokenProvider.INTERNAL_TOKEN_HEADER, required = false) String token) {
        if (!internalTokenProvider.getToken().equals(token)) return unauthorized();
        return ApiResponse.from(ticketService.releaseReservation(id, username));
    }

    private ResponseEntity<ResponseErrorTemplate> unauthorized() {
        return ApiResponse.from(new ResponseErrorTemplate(ApiConstant.UN_AUTHORIZATION.getDescription(),
                ApiConstant.UN_AUTHORIZATION.getKey(), null, true));
    }
}
