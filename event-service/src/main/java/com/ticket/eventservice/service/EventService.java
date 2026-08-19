package com.ticket.eventservice.service;

import com.ticket.eventservice.dto.EventRequest;
import com.ticket.eventservice.dto.ResponseErrorTemplate;

public interface EventService {

    ResponseErrorTemplate create(EventRequest request);
    ResponseErrorTemplate update(Long id, EventRequest request);
    ResponseErrorTemplate getById(Long id);
    void delete(Long id);
}