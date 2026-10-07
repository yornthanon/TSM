package com.ticket.eventservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.eventservice.Enum.EventStatus;
import com.ticket.eventservice.dto.EventRequest;
import com.ticket.eventservice.dto.EventResponse;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.eventservice.entity.Event;
import com.ticket.eventservice.mapper.EventMapper;
import com.ticket.eventservice.repository.EventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventServiceImpl implements EventService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static String newShareToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private final EventMapper eventMapper;
    private final EventRepository eventRepository;

    public EventServiceImpl(EventMapper eventMapper, EventRepository eventRepository) {
        this.eventMapper = eventMapper;
        this.eventRepository = eventRepository;
    }

    @Override
    public ResponseErrorTemplate create(EventRequest request) {
        Event event = eventMapper.toEntity(request);
        event.setShareToken(newShareToken());
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
        event.get().setImageUrl(request.getImageUrl());
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
        // status is nullable: the create endpoint never defaults it, so grouping
        // on it unguarded NPEs and turns the whole stats call into a 500.
        Map<String, Long> byStatus = events.stream()
                .filter(e -> e.getStatus() != null)
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
    public ResponseErrorTemplate updateStatus(Long id, EventStatus status) {
        Optional<Event> event = eventRepository.findById(id);
        if (event.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_NOT_FOUND.getFormattedDescription(id),
                    ApiConstant.EVENT_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        Event existing = event.get();
        existing.setStatus(status);
        eventRepository.save(existing);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                eventMapper.toResponse(existing),
                false);
    }

    @Override
    public ResponseErrorTemplate delete(Long id) {
        Optional<Event> event = eventRepository.findById(id);
        if (event.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_NOT_FOUND.getFormattedDescription(id),
                    ApiConstant.EVENT_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        final boolean hasLinkedSeats;
        final boolean hasLinkedOrders;
        try {
            hasLinkedSeats = eventRepository.hasLinkedSeats(id);
            hasLinkedOrders = eventRepository.hasLinkedOrders(id);
        } catch (DataAccessException exception) {
            log.error("Event deletion dependency check failed for event {} ({})",
                    id, exception.getClass().getSimpleName());
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_DEPENDENCY_CHECK_UNAVAILABLE.getDescription(),
                    ApiConstant.EVENT_DEPENDENCY_CHECK_UNAVAILABLE.getKey(),
                    new EmptyObject(),
                    true);
        }

        if (hasLinkedSeats || hasLinkedOrders) {
            return new ResponseErrorTemplate(
                    ApiConstant.EVENT_HAS_LINKED_RECORDS.getDescription(),
                    ApiConstant.EVENT_HAS_LINKED_RECORDS.getKey(),
                    Map.of("hasLinkedSeats", hasLinkedSeats, "hasLinkedOrders", hasLinkedOrders),
                    true);
        }

        eventRepository.delete(event.get());
        return new ResponseErrorTemplate(
                "Event deleted successfully",
                ApiConstant.SUCCESS.getKey(),
                null,
                false);
    }

    @Override
    public List<EventResponse> findPublicEvents() {
        return eventRepository.findByStatus(EventStatus.APPROVED).stream()
                .map(eventMapper::toResponse).toList();
    }

    @Override
    public List<EventResponse> findPublicEvents(Long tenantId) {
        if (tenantId == null) return findPublicEvents();
        return eventRepository.findByStatusAndTenantId(EventStatus.APPROVED, tenantId).stream()
                .map(eventMapper::toResponse).toList();
    }

    @Override
    public EventResponse getPublicEventById(Long id) {
        return eventRepository.findById(id).filter(event -> event.getStatus() == EventStatus.APPROVED)
                .map(eventMapper::toResponse).orElse(null);
    }

    @Override
    public EventResponse getPublicEventById(Long id, Long tenantId) {
        if (tenantId == null) return getPublicEventById(id);
        return eventRepository.findByIdAndTenantId(id, tenantId)
                .filter(event -> event.getStatus() == EventStatus.APPROVED)
                .map(eventMapper::toResponse).orElse(null);
    }

    @Override
    public EventResponse getPublicEventByShareToken(String shareToken) {
        if (shareToken == null || !shareToken.matches("[0-9a-fA-F]{64}")) return null;
        return eventRepository.findByShareToken(shareToken)
                .filter(event -> event.getStatus() == EventStatus.APPROVED)
                .map(eventMapper::toResponse).orElse(null);
    }

    @Override
    public ResponseErrorTemplate getShareLink(Long id) {
        return eventRepository.findById(id)
                .map(event -> new ResponseErrorTemplate("Share link retrieved", "SHARE_LINK_FOUND", event.getShareToken(), false))
                .orElseGet(() -> new ResponseErrorTemplate("Event not found", "EVENT_NOT_FOUND", new EmptyObject(), true));
    }

    @Override
    public ResponseErrorTemplate regenerateShareLink(Long id) {
        return eventRepository.findById(id).map(event -> {
            event.setShareToken(newShareToken());
            eventRepository.save(event);
            return new ResponseErrorTemplate("Share link regenerated", "SHARE_LINK_REGENERATED", event.getShareToken(), false);
        }).orElseGet(() -> new ResponseErrorTemplate("Event not found", "EVENT_NOT_FOUND", new EmptyObject(), true));
    }

    @Override
    public ResponseErrorTemplate revokeShareLink(Long id) {
        return eventRepository.findById(id).map(event -> {
            event.setShareToken(newShareToken());
            eventRepository.save(event);
            return new ResponseErrorTemplate("Share link revoked; a new token is ready to share", "SHARE_LINK_REVOKED", null, false);
        }).orElseGet(() -> new ResponseErrorTemplate("Event not found", "EVENT_NOT_FOUND", new EmptyObject(), true));
    }

}
