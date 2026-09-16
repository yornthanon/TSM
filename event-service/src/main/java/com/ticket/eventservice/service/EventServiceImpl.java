package com.ticket.eventservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.eventservice.dto.EventRequest;
import com.ticket.eventservice.dto.EventResponse;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.eventservice.entity.Event;
import com.ticket.eventservice.mapper.EventMapper;
import com.ticket.eventservice.repository.EventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventServiceImpl implements EventService {

    private final EventMapper eventMapper;
    private final EventRepository eventRepository;

    public EventServiceImpl(EventMapper eventMapper, EventRepository eventRepository) {
        this.eventMapper = eventMapper;
        this.eventRepository = eventRepository;
    }

    @Override
    public ResponseErrorTemplate create(EventRequest request) {
        Event event = eventMapper.toEntity(request);
        eventRepository.save(event);
        EventResponse eventResponse = eventMapper.toResponse(event);
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                eventResponse,
                false);
    }

    @Override
    public ResponseErrorTemplate update(Long id, EventRequest request) {
        Optional<Event> event = eventRepository.findById(id);
        if (event.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_NOT_FOUND.getFormattedDescription(id),
                    ApiConstant.EVENT_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        event.get().setEventDate(request.getEventDate());
        event.get().setTitle(request.getTitle());
        event.get().setDescription(request.getDescription());
        event.get().setLocation(request.getLocation());
        event.get().setEventType(request.getEventType());
        event.get().setStatus(request.getStatus());
        event.get().setBasePrice(request.getBasePrice());
        event.get().setCapacity(request.getCapacity());

        eventRepository.save(event.get());

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                eventMapper.toResponse(event.get()),
                false);
    }

    @Override
    public ResponseErrorTemplate getById(Long id) {
        Optional<Event> event = eventRepository.findById(id);
        if (event.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_NOT_FOUND.getFormattedDescription(id),
                    ApiConstant.EVENT_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                eventMapper.toResponse(event.get()),
                false);
    }

    @Override
    public ResponseErrorTemplate findAll() {
        List<EventResponse> events = eventMapper.toResponseList(eventRepository.findAll());
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                events,
                false);
    }

    @Override
    public ResponseErrorTemplate getStats() {
        List<Event> events = eventRepository.findAll();
        Map<String, Long> byStatus = events.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus().name(), Collectors.counting()));
        Map<String, Long> byType = events.stream()
                .filter(e -> e.getEventType() != null)
                .collect(Collectors.groupingBy(e -> e.getEventType().name(), Collectors.counting()));
        long upcoming = events.stream()
                .filter(e -> e.getEventDate() != null && e.getEventDate().isAfter(LocalDateTime.now()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", events.size());
        stats.put("upcoming", upcoming);
        stats.put("byStatus", byStatus);
        stats.put("byType", byType);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                stats,
                false);
    }

    @Override
    public ResponseErrorTemplate updateStatus(Long id, String status) {
        Optional<Event> event = eventRepository.findById(id);
        if (event.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_NOT_FOUND.getFormattedDescription(id),
                    ApiConstant.EVENT_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        Event existing = event.get();
        existing.setStatus(com.ticket.eventservice.Enum.EventStatus.valueOf(status));
        eventRepository.save(existing);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                eventMapper.toResponse(existing),
                false);
    }

    @Override
    public void delete(Long id) {
        eventRepository.deleteById(id);
    }
}
