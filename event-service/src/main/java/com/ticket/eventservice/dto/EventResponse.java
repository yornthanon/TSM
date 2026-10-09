package com.ticket.eventservice.dto;

import com.ticket.eventservice.Enum.EventStatus;
import com.ticket.eventservice.Enum.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private Long id;

    private String title;

    private String description;

    private String imageUrl;

    private String location;

    private LocalDateTime eventDate;

    private BigDecimal basePrice;

    private Integer capacity;

    private EventType eventType;

    private EventStatus status;

    private Long tenantId;

    private LocalDateTime createdAt;

    private String createdBy;

    private LocalDateTime updatedAt;

    private String updatedBy;

    /** Backward-compatible constructor for existing service tests and clients. */
    public EventResponse(Long id, String title, String description, String imageUrl,
                         String location, LocalDateTime eventDate, BigDecimal basePrice,
                         Integer capacity, EventType eventType, EventStatus status,
                         LocalDateTime createdAt, String createdBy,
                         LocalDateTime updatedAt, String updatedBy) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.location = location;
        this.eventDate = eventDate;
        this.basePrice = basePrice;
        this.capacity = capacity;
        this.eventType = eventType;
        this.status = status;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
    }
}
