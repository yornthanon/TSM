package com.ticket.ticketservice.repository;
import com.ticket.ticketservice.Enum.TicketStatus;
import com.ticket.ticketservice.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findAllByEventId(Long eventId);

    List<Ticket> findAllByEventIdAndTicketStatus(Long eventId, TicketStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Ticket t where t.eventId = :eventId and t.ticketStatus = :status order by t.id")
    List<Ticket> findTicketsForUpdate(@Param("eventId") Long eventId, @Param("status") TicketStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Ticket t where t.eventId = :eventId and t.ticketStatus = :status "
            + "and t.lockedUntil is not null and t.lockedUntil < :now order by t.id")
    List<Ticket> findExpiredTicketsForUpdate(@Param("eventId") Long eventId,
                                             @Param("status") TicketStatus status,
                                             @Param("now") LocalDateTime now);

    Optional<Ticket> findFirstBySeatNumberAndEventId(String seatNumber, Long eventId);
}
