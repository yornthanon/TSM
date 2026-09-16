package com.ticket.eventservice.dto;

import com.ticket.eventservice.Enum.EventStatus;
import com.ticket.eventservice.Enum.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than or equal to 255 characters")
    private String title;

    private String description;

    private String location;

    private LocalDateTime eventDate;

    private BigDecimal basePrice;

    private Integer capacity;

    private EventType eventType;

    private EventStatus status;
}