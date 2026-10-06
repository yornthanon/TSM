package com.ticket.ticketservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.ticketservice.Enum.TicketStatus;
import com.ticket.ticketservice.Enum.TicketType;
import com.ticket.ticketservice.dto.TicketRequest;
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

    @Test
    void updatesAvailableSeatDetailsWithoutChangingEventAssignment() {
        Ticket ticket = ticket(14L, TicketStatus.AVAILABLE);
        TicketRequest request = ticketRequest(1L, "B-14", new BigDecimal("25.00"), TicketType.VIP);
        when(ticketRepository.findById(14L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.findFirstBySeatNumberAndEventId("B-14", 1L)).thenReturn(Optional.empty());
        when(ticketRepository.save(ticket)).thenReturn(ticket);

        ResponseErrorTemplate response = service.updateTicket(14L, request);

        assertThat(response.isError()).isFalse();
        assertThat(ticket.getEventId()).isEqualTo(1L);
        assertThat(ticket.getSeatNumber()).isEqualTo("B-14");
        assertThat(ticket.getPrice()).isEqualByComparingTo("25.00");
        assertThat(ticket.getTicketType()).isEqualTo(TicketType.VIP);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void rejectsSeatNumberAlreadyUsedByAnotherTicket() {
        Ticket ticket = ticket(15L, TicketStatus.AVAILABLE);
        Ticket conflictingTicket = ticket(16L, TicketStatus.AVAILABLE);
        TicketRequest request = ticketRequest(1L, "A-16", BigDecimal.TEN, TicketType.STANDARD);
        when(ticketRepository.findById(15L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.findFirstBySeatNumberAndEventId("A-16", 1L))
                .thenReturn(Optional.of(conflictingTicket));

        ResponseErrorTemplate response = service.updateTicket(15L, request);

        assertThat(response.isError()).isTrue();
        assertThat(response.code()).isEqualTo("400");
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void refusesToEditSoldSeat() {
        Ticket ticket = ticket(17L, TicketStatus.SOLD);
        TicketRequest request = ticketRequest(1L, "B-17", new BigDecimal("40.00"), TicketType.VIP);
        when(ticketRepository.findById(17L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate response = service.updateTicket(17L, request);

        assertThat(response.isError()).isTrue();
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void requiresDedicatedActionsForTicketStatusChanges() {
        Ticket ticket = ticket(18L, TicketStatus.AVAILABLE);
        TicketRequest request = ticketRequest(1L, "A-18", BigDecimal.TEN, TicketType.STANDARD);
        request.setTicketStatus(TicketStatus.SOLD);
        when(ticketRepository.findById(18L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate response = service.updateTicket(18L, request);

        assertThat(response.isError()).isTrue();
        verify(ticketRepository, never()).save(any(Ticket.class));
    }

    @Test
    void refusesToDeleteLockedSeatUntilItIsReleased() {
        Ticket ticket = ticket(19L, TicketStatus.LOCKED);
        when(ticketRepository.findById(19L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate response = service.deleteTicket(19L);

        assertThat(response.isError()).isTrue();
        verify(ticketRepository, never()).deleteById(19L);
    }

    @Test
    void adminLockAndUnlockTransitionsKeepLockMetadataConsistent() {
        Ticket ticket = ticket(20L, TicketStatus.AVAILABLE);
        when(ticketRepository.findById(20L)).thenReturn(Optional.of(ticket));

        ResponseErrorTemplate locked = service.lockTicketById(20L);
        assertThat(locked.isError()).isFalse();
        assertThat(ticket.getTicketStatus()).isEqualTo(TicketStatus.LOCKED);
        assertThat(ticket.getLockedBy()).isEqualTo("admin");
        assertThat(ticket.getLockedUntil()).isAfter(LocalDateTime.now());

        ResponseErrorTemplate unlocked = service.unlockTicketById(20L);
        assertThat(unlocked.isError()).isFalse();
        assertThat(ticket.getTicketStatus()).isEqualTo(TicketStatus.AVAILABLE);
        assertThat(ticket.getLockedBy()).isNull();
        assertThat(ticket.getLockedUntil()).isNull();
        verify(ticketRepository, times(2)).save(ticket);
    }

    @Test
    void rejectsIncompleteSeatCreationBeforePersistence() {
        TicketRequest request = ticketRequest(1L, "A-21", null, TicketType.STANDARD);

        ResponseErrorTemplate response = service.createTicket(request);

        assertThat(response.isError()).isTrue();
        assertThat(response.code()).isEqualTo("400");
        verify(ticketRepository, never()).save(any(Ticket.class));
        verify(eventClient, never()).getEventById(anyLong());
    }

    private TicketRequest ticketRequest(Long eventId, String seatNumber, BigDecimal price, TicketType type) {
        TicketRequest request = new TicketRequest();
        request.setEventId(eventId);
        request.setSeatNumber(seatNumber);
        request.setPrice(price);
        request.setTicketType(type);
        return request;
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
