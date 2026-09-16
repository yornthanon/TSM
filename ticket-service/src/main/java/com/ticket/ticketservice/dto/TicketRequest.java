package com.ticket.ticketservice.dto;

import com.ticket.ticketservice.Enum.TicketStatus;
import com.ticket.ticketservice.Enum.TicketType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Data
public class TicketRequest {

    @NotNull(message = "Event id cannot be null")
    private Long eventId;

    @NotNull(message = "Seat number cannot be null")
    private String seatNumber;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private TicketType ticketType;

    private TicketStatus ticketStatus;
}