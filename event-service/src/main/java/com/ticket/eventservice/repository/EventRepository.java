package com.ticket.eventservice.repository;

import com.ticket.eventservice.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    /** Checks the shared modular-monolith schema without loading all inventory rows. */
    @Query(value = "SELECT EXISTS (SELECT 1 FROM tt_ticket WHERE event_id = :eventId)", nativeQuery = true)
    boolean hasLinkedSeats(@Param("eventId") Long eventId);

    /** Any order history, including cancelled orders, keeps an event from being deleted. */
    @Query(value = "SELECT EXISTS (SELECT 1 FROM tt_order o "
            + "WHERE o.event_id = :eventId "
            + "OR o.ticket_id IN (SELECT t.id FROM tt_ticket t WHERE t.event_id = :eventId))", nativeQuery = true)
    boolean hasLinkedOrders(@Param("eventId") Long eventId);

    List<Event> findByStatus(com.ticket.eventservice.Enum.EventStatus status);
}
