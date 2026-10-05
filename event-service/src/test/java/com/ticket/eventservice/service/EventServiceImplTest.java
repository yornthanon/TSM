package com.ticket.eventservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.eventservice.Enum.EventStatus;
import com.ticket.eventservice.Enum.EventType;
import com.ticket.eventservice.dto.EventRequest;
import com.ticket.eventservice.dto.EventResponse;
import com.ticket.eventservice.entity.Event;
import com.ticket.eventservice.mapper.EventMapper;
import com.ticket.eventservice.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {
    @Mock
    private EventMapper eventMapper;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventServiceImpl service;

    @Test
    void createsEventAndReturnsMappedResponse() {
        LocalDateTime eventDate = LocalDateTime.of(2026, 12, 20, 19, 30);
        EventRequest request = new EventRequest(
                "KORA Music Night",
                "A live concert",
                "https://cdn.example.com/event.jpg",
                "Phnom Penh",
                eventDate,
                new BigDecimal("25.00"),
                500,
                EventType.CONCERT,
                EventStatus.DRAFT);
        Event entity = new Event();
        EventResponse expectedResponse = new EventResponse(
                17L,
                request.getTitle(),
                request.getDescription(),
                request.getImageUrl(),
                request.getLocation(),
                request.getEventDate(),
                request.getBasePrice(),
                request.getCapacity(),
                request.getEventType(),
                request.getStatus(),
                null,
                null,
                null,
                null);

        when(eventMapper.toEntity(request)).thenReturn(entity);
        when(eventRepository.save(entity)).thenReturn(entity);
        when(eventMapper.toResponse(entity)).thenReturn(expectedResponse);

        ResponseErrorTemplate result = service.create(request);

        assertFalse(result.isError());
        assertSame(expectedResponse, result.data());
        verify(eventMapper).toEntity(request);
        verify(eventRepository).save(entity);
        verify(eventMapper).toResponse(entity);
    }

    @Test
    void createsEventWithUploadedImageUrlAndOptionalFields() {
        EventRequest request = new EventRequest(
                "Draft event", null, "https://res.cloudinary.com/demo/image/upload/event.jpg",
                null, null, null, null, null, EventStatus.DRAFT);
        Event entity = new Event();
        EventResponse response = new EventResponse();

        when(eventMapper.toEntity(request)).thenReturn(entity);
        when(eventRepository.save(entity)).thenReturn(entity);
        when(eventMapper.toResponse(entity)).thenReturn(response);

        ResponseErrorTemplate result = service.create(request);

        assertFalse(result.isError());
        assertEquals(response, result.data());
        verify(eventRepository).save(entity);
    }
}
