package com.ticket.orderservice.client;

import com.ticket.common.internal.InternalTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@Slf4j
public class EventClient {

    private final WebClient webClient;
    private final InternalTokenProvider internalTokenProvider;

    public EventClient(WebClient.Builder webClient, InternalTokenProvider internalTokenProvider) {
        this.webClient = webClient.build();
        this.internalTokenProvider = internalTokenProvider;
    }

    @Value("${event.service.url:http://localhost:8082/api/v1/events}")
    private String eventServiceUrl;

    public Mono<Map> getEventById(Long eventId) {
        return webClient.get()
                .uri(eventServiceUrl + "/{id}", eventId)
                .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .header(internalTokenProvider.headerName(), internalTokenProvider.getToken())
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("Error calling event service for id {}: {}", eventId, e.getMessage()))
                .onErrorResume(e -> Mono.empty());
    }
}
