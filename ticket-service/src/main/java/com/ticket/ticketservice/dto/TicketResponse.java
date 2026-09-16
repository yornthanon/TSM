package com.ticket.ticketservice.dto;


import com.ticket.ticketservice.Enum.TicketStatus;
import com.ticket.ticketservice.Enum.TicketType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TicketResponse {

    private Long id;

    private Long eventId;

    private String seatNumber;

    private BigDecimal price;

    private TicketType ticketType;

    private TicketStatus ticketStatus;

    private LocalDateTime lockedUntil;

    private String lockedBy;

    private LocalDateTime createdAt;

    private String createdBy;

    private LocalDateTime updatedAt;

    private String updatedBy;
}