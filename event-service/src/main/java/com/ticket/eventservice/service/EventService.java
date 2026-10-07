package com.ticket.eventservice.service;

import com.ticket.eventservice.dto.EventRequest;
import com.ticket.eventservice.dto.EventResponse;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.eventservice.Enum.EventStatus;

import java.util.List;

public interface EventService {

    ResponseErrorTemplate create(EventRequest request);
    ResponseErrorTemplate update(Long id, EventRequest request);
    ResponseErrorTemplate getById(Long id);
    ResponseErrorTemplate findAll();
    ResponseErrorTemplate getStats();
    ResponseErrorTemplate delete(Long id);

    ResponseErrorTemplate updateStatus(Long id, EventStatus status);

    List<EventResponse> findPublicEvents();

    List<EventResponse> findPublicEvents(Long tenantId);

    EventResponse getPublicEventById(Long id);

    EventResponse getPublicEventById(Long id, Long tenantId);
    EventResponse getPublicEventByShareToken(String shareToken);
    ResponseErrorTemplate getShareLink(Long id);
    ResponseErrorTemplate regenerateShareLink(Long id);
    ResponseErrorTemplate revokeShareLink(Long id);
}
