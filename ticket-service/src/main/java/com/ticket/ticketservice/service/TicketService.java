package com.ticket.ticketservice.service;


import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.ticketservice.dto.TicketLockRequest;
import com.ticket.ticketservice.dto.TicketRequest;

public interface TicketService {

    ResponseErrorTemplate createTicket(TicketRequest ticketRequest);

    ResponseErrorTemplate getTicketById(Long ticketId);

    ResponseErrorTemplate lockTicket(TicketLockRequest ticketLockRequest);

    void unlockTicket(Long eventId, Integer quantity);

    ResponseErrorTemplate findAll();

    ResponseErrorTemplate getStats();

    ResponseErrorTemplate updateTicket(Long ticketId, TicketRequest ticketRequest);

    ResponseErrorTemplate deleteTicket(Long ticketId);

    ResponseErrorTemplate unlockTicketById(Long ticketId);

    ResponseErrorTemplate lockTicketById(Long ticketId);

}