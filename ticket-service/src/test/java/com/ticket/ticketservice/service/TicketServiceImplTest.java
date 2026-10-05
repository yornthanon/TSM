package com.ticket.ticketservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.ticketservice.Enum.TicketStatus;
import com.ticket.ticketservice.dto.TicketResponse;
import com.ticket.ticketservice.entity.Ticket;
import com.ticket.ticketservice.mapper.TicketMapper;
import com.ticket.ticketservice.client.EventClient;
import com.ticket.ticketservice.repository.TicketRepository;
import com.ticket.ticketservice.service.Impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {
    @Mock private TicketMapper ticketMapper;
    @Mock private EventClient eventClient;
    @Mock private TicketRepository ticketRepository;
    private TicketServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new TicketServiceImpl(ticketMapper, eventClient, ticketRepository);
        lenient().when(ticketMapper.toResponse(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            TicketResponse response = new TicketResponse();
            response.setId(ticket.getId());
            response.setTicketStatus(ticket.getTicketStatus());
            response.setLockedBy(ticket.getLockedBy());
            response.setLockedUntil(ticket.getLockedUntil());
            response.setPrice(ticket.getPrice());
            return response;
        });
    }

    @Test
    void reserveReclaimsExpiredLockBeforeLockingForNewCheckout() {
        Ticket ticket = ticket(7L, TicketStatus.LOCKED);
        ticket.setLockedBy("timed-out-user");
        ticket.setLockedUntil(LocalDateTime.now().minusMinutes(1));
        when(ticketRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate response = service.reserveTicket(7L, 1, "new-user", 15);

        assertThat(response.isError()).isFalse();
        assertThat(ticket.getTicketStatus()).isEqualTo(TicketStatus.LOCKED);
        assertThat(ticket.getLockedBy()).isEqualTo("new-user");
        assertThat(ticket.getLockedUntil()).isAfter(LocalDateTime.now());
        verify(ticketRepository).save(ticket);
    }

    @Test
    void releaseReservationUnlocksOnlyTheReservationOwnerAfterPaymentFailure() {
        Ticket ticket = ticket(8L, TicketStatus.LOCKED);
        ticket.setLockedBy("buyer");
        ticket.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(ticketRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate response = service.releaseReservation(8L, "buyer");

        assertThat(response.isError()).isFalse();
        assertThat(ticket.getTicketStatus()).isEqualTo(TicketStatus.AVAILABLE);
        assertThat(ticket.getLockedBy()).isNull();
        assertThat(ticket.getLockedUntil()).isNull();
        verify(ticketRepository).save(ticket);

        Ticket otherOwnerTicket = ticket(9L, TicketStatus.LOCKED);
        otherOwnerTicket.setLockedBy("original-buyer");
        when(ticketRepository.findByIdForUpdate(9L)).thenReturn(Optional.of(otherOwnerTicket));
        service.releaseReservation(9L, "different-buyer");
        assertThat(otherOwnerTicket.getTicketStatus()).isEqualTo(TicketStatus.LOCKED);
        verify(ticketRepository, never()).save(otherOwnerTicket);
    }

    @Test
    void confirmSaleRejectsExpiredCheckoutAndDoesNotSellTicket() {
        Ticket ticket = ticket(10L, TicketStatus.LOCKED);
        ticket.setLockedBy("buyer");
        ticket.setLockedUntil(LocalDateTime.now().minusSeconds(1));
        when(ticketRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate response = service.confirmSale(10L, "buyer");

        assertThat(response.isError()).isTrue();
        assertThat(response.code()).isEqualTo("423");
        assertThat(ticket.getTicketStatus()).isEqualTo(TicketStatus.LOCKED);
        verify(ticketRepository, never()).save(ticket);
    }

    @Test
    void confirmSaleChangesValidReservationToSoldAndClearsLockMetadata() {
        Ticket ticket = ticket(11L, TicketStatus.LOCKED);
        ticket.setLockedBy("buyer");
        ticket.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(ticketRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate response = service.confirmSale(11L, "buyer");

        assertThat(response.isError()).isFalse();
        assertThat(ticket.getTicketStatus()).isEqualTo(TicketStatus.SOLD);
        assertThat(ticket.getLockedBy()).isNull();
        assertThat(ticket.getLockedUntil()).isNull();
        verify(ticketRepository).save(ticket);
    }

    @Test
    void scheduledCleanupReleasesAllExpiredCheckoutLocks() {
        Ticket first = ticket(12L, TicketStatus.LOCKED);
        first.setLockedBy("buyer-1");
        Ticket second = ticket(13L, TicketStatus.LOCKED);
        second.setLockedBy("buyer-2");
        when(ticketRepository.findAllExpiredTicketsForUpdate(eq(TicketStatus.LOCKED), any(LocalDateTime.class)))
                .thenReturn(List.of(first, second));

        service.releaseExpiredReservations();

        assertThat(first.getTicketStatus()).isEqualTo(TicketStatus.AVAILABLE);
        assertThat(first.getLockedBy()).isNull();
        assertThat(second.getTicketStatus()).isEqualTo(TicketStatus.AVAILABLE);
        assertThat(second.getLockedBy()).isNull();
        verify(ticketRepository).saveAll(List.of(first, second));
    }

    private Ticket ticket(Long id, TicketStatus status) {
        Ticket ticket = new Ticket();
        ticket.setId(id);
        ticket.setEventId(1L);
        ticket.setTicketStatus(status);
        ticket.setSeatNumber("A-" + id);
        ticket.setPrice(BigDecimal.TEN);
        return ticket;
    }
}
