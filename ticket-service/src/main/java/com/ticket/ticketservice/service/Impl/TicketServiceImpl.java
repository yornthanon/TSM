package com.ticket.ticketservice.service.Impl;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.ticketservice.Enum.TicketStatus;
import com.ticket.ticketservice.client.EventClient;
import com.ticket.ticketservice.dto.TicketLockRequest;
import com.ticket.ticketservice.dto.TicketRequest;
import com.ticket.ticketservice.dto.TicketResponse;
import com.ticket.ticketservice.entity.Ticket;
import com.ticket.ticketservice.mapper.TicketMapper;
import com.ticket.ticketservice.repository.TicketRepository;
import com.ticket.ticketservice.service.TicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TicketServiceImpl implements TicketService {

    private final TicketMapper ticketMapper;
    private final EventClient eventClient;
    private final TicketRepository ticketRepository;

    public TicketServiceImpl(TicketMapper ticketMapper, EventClient eventClient,
                             TicketRepository ticketRepository) {
        this.ticketMapper = ticketMapper;
        this.eventClient = eventClient;
        this.ticketRepository = ticketRepository;
    }

    @Override
    public ResponseErrorTemplate createTicket(TicketRequest ticketRequest) {

        Optional<Ticket> ticketInDb = ticketRepository.findFirstBySeatNumberAndEventId(
                ticketRequest.getSeatNumber(), ticketRequest.getEventId());
        if(ticketInDb.isPresent()) {
            return new ResponseErrorTemplate(
                    ApiConstant.SEAT_NUMBER_ALREADY_EXISTS.getFormattedDescription(ticketRequest.getSeatNumber()),
                    ApiConstant.SEAT_NUMBER_ALREADY_EXISTS.getKey(),
                    new EmptyObject(),
                    true);
        }

        var eventResponse = eventClient.getEventById(ticketRequest.getEventId());
        if(eventResponse == null || eventResponse.isError() || "404".equalsIgnoreCase(eventResponse.code())) {
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_NOT_FOUND.getFormattedDescription(ticketRequest.getEventId()),
                    ApiConstant.EVENT_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        Ticket ticket = ticketMapper.toEntity(ticketRequest);
        ticket.setEventId(ticketRequest.getEventId());
        if (ticketRequest.getTicketStatus() == null) {
            ticket.setTicketStatus(TicketStatus.AVAILABLE);
        }
        ticketRepository.save(ticket);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                ticketMapper.toResponse(ticket),
                false
        );
    }

    @Override
    public ResponseErrorTemplate getTicketById(Long ticketId) {
       Optional<Ticket> ticket = ticketRepository.findById(ticketId);
        return ticket.map(value -> new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                ticketMapper.toResponse(value),
                false
        )).orElseGet(() -> new ResponseErrorTemplate(
                ApiConstant.TICKET_NOT_FOUND.getFormattedDescription(ticketId),
                ApiConstant.TICKET_NOT_FOUND.getKey(),
                new EmptyObject(),
                true
        ));

    }

    @Override
    @Transactional
    public ResponseErrorTemplate lockTicket(TicketLockRequest ticketLockRequest) {
        if (ticketLockRequest == null || ticketLockRequest.getEventId() == null
                || ticketLockRequest.getQuantity() == null || ticketLockRequest.getQuantity() < 1
                || ticketLockRequest.getLockDuration() == null || ticketLockRequest.getLockDuration() < 1
                || ticketLockRequest.getLockDuration() > 30) {
            return new ResponseErrorTemplate(
                    "Provide a valid event, quantity, and lock duration (1–30 minutes).",
                    ApiConstant.INVALID_REQUEST.getKey(),
                    new EmptyObject(),
                    true
            );
        }

        LocalDateTime now = LocalDateTime.now();
        List<Ticket> expiredTickets = ticketRepository.findExpiredTicketsForUpdate(
                ticketLockRequest.getEventId(), TicketStatus.LOCKED, now);
        expiredTickets.forEach(ticket -> {
            ticket.setTicketStatus(TicketStatus.AVAILABLE);
            ticket.setLockedBy(null);
            ticket.setLockedUntil(null);
        });
        if (!expiredTickets.isEmpty()) ticketRepository.saveAll(expiredTickets);

        List<Ticket> availableTickets = ticketRepository.findTicketsForUpdate(
                ticketLockRequest.getEventId(), TicketStatus.AVAILABLE);
        if (availableTickets.size() < ticketLockRequest.getQuantity()) {
            return new ResponseErrorTemplate(
                    ApiConstant.TICKET_NOT_AVAILABLE.getDescription(),
                    ApiConstant.TICKET_NOT_AVAILABLE.getKey(),
                    new EmptyObject(),
                    true
            );
        }

        List<Ticket> ticketsToLock = new ArrayList<>(availableTickets.subList(0, ticketLockRequest.getQuantity()));
        ticketsToLock.forEach(ticket -> {
            ticket.setTicketStatus(TicketStatus.LOCKED);
            ticket.setLockedBy(ticketLockRequest.getUserId());
            ticket.setLockedUntil(now.plusMinutes(ticketLockRequest.getLockDuration()));
        });

        List<TicketResponse> tickets = ticketRepository.saveAll(ticketsToLock).stream()
                .map(ticketMapper::toResponse)
                .toList();
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                tickets,
                false
        );
    }

    @Override
    public void unlockTicket(Long eventId, Integer quantity) {
        List<Ticket> lockedTickets = ticketRepository.findAllByEventIdAndTicketStatus(
                eventId, TicketStatus.LOCKED
        );

        if (lockedTickets.size() < quantity) {
            quantity = lockedTickets.size();
        }

        List<Ticket> ticketsToUnlock = lockedTickets.subList(0, quantity);

        ticketsToUnlock.forEach(
                ticket -> {
                    ticket.setTicketStatus(TicketStatus.AVAILABLE);
                    ticket.setLockedUntil(null);
                    ticket.setLockedBy(null);
                }
        );

        ticketRepository.saveAll(ticketsToUnlock);
    }

    @Override
    public ResponseErrorTemplate findAll() {
        List<TicketResponse> tickets = ticketRepository.findAll().stream()
                .map(ticketMapper::toResponse)
                .toList();
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                tickets,
                false);
    }

    @Override
    public ResponseErrorTemplate getStats() {
        List<Ticket> tickets = ticketRepository.findAll();
        // ticketStatus is nullable for the same reason as event status.
        Map<String, Long> byStatus = tickets.stream()
                .filter(t -> t.getTicketStatus() != null)
                .collect(Collectors.groupingBy(t -> t.getTicketStatus().name(), Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", tickets.size());
        stats.put("byStatus", byStatus);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                stats,
                false);
    }

    @Override
    public ResponseErrorTemplate updateTicket(Long ticketId, TicketRequest ticketRequest) {
        Optional<Ticket> existing = ticketRepository.findById(ticketId);
        if (existing.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.TICKET_NOT_FOUND.getFormattedDescription(ticketId),
                    ApiConstant.TICKET_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        Ticket ticket = existing.get();
        if (ticketRequest.getPrice() != null) {
            ticket.setPrice(ticketRequest.getPrice());
        }
        if (ticketRequest.getSeatNumber() != null && !ticketRequest.getSeatNumber().isBlank()) {
            ticket.setSeatNumber(ticketRequest.getSeatNumber());
        }
        if (ticketRequest.getTicketType() != null) {
            ticket.setTicketType(ticketRequest.getTicketType());
        }
        if (ticketRequest.getTicketStatus() != null) {
            ticket.setTicketStatus(ticketRequest.getTicketStatus());
        }
        ticketRepository.save(ticket);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                ticketMapper.toResponse(ticket),
                false);
    }

    @Override
    public ResponseErrorTemplate deleteTicket(Long ticketId) {
        Optional<Ticket> existing = ticketRepository.findById(ticketId);
        if (existing.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.TICKET_NOT_FOUND.getFormattedDescription(ticketId),
                    ApiConstant.TICKET_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        if (existing.get().getTicketStatus() == TicketStatus.SOLD) {
            return new ResponseErrorTemplate(
                    ApiConstant.TICKET_ALREADY_SOLD.getFormattedDescription(ticketId),
                    ApiConstant.TICKET_ALREADY_SOLD.getKey(),
                    new EmptyObject(),
                    true);
        }
        ticketRepository.deleteById(ticketId);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                new EmptyObject(),
                false);
    }

    @Override
    public ResponseErrorTemplate unlockTicketById(Long ticketId) {
        Optional<Ticket> existing = ticketRepository.findById(ticketId);
        if (existing.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.TICKET_NOT_FOUND.getFormattedDescription(ticketId),
                    ApiConstant.TICKET_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        Ticket ticket = existing.get();
        if (ticket.getTicketStatus() == TicketStatus.LOCKED) {
            ticket.setTicketStatus(TicketStatus.AVAILABLE);
            ticket.setLockedUntil(null);
            ticket.setLockedBy(null);
            ticketRepository.save(ticket);
        }

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                ticketMapper.toResponse(ticket),
                false);
    }

    @Override
    public ResponseErrorTemplate lockTicketById(Long ticketId) {
        Optional<Ticket> existing = ticketRepository.findById(ticketId);
        if (existing.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.TICKET_NOT_FOUND.getFormattedDescription(ticketId),
                    ApiConstant.TICKET_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        Ticket ticket = existing.get();
        if (ticket.getTicketStatus() == TicketStatus.LOCKED || ticket.getTicketStatus() == TicketStatus.SOLD) {
            return new ResponseErrorTemplate(
                    "Ticket is already locked or sold",
                    "TICKET_ALREADY_LOCKED",
                    ticketMapper.toResponse(ticket),
                    true);
        }

        ticket.setTicketStatus(TicketStatus.LOCKED);
        ticket.setLockedBy("admin");
        ticket.setLockedUntil(LocalDateTime.now().plusMinutes(30));
        ticketRepository.save(ticket);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                ticketMapper.toResponse(ticket),
                false);
    }
}
