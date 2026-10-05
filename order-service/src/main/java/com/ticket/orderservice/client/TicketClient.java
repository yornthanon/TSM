package com.ticket.orderservice.client;

import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.common.tenant.TenantContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class TicketClient {
    private final WebClient webClient;
    private final InternalTokenProvider internalTokenProvider;

    @Value("${ticket.service.url:http://localhost:8083/api/v1/tickets}")
    private String ticketServiceUrl;

    public TicketClient(WebClient.Builder webClient, InternalTokenProvider internalTokenProvider) {
        this.webClient = webClient.build();
        this.internalTokenProvider = internalTokenProvider;
    }

    public Mono<ResponseErrorTemplate> reserve(Long ticketId, Integer quantity, String username) {
        return webClient.post()
                .uri(ticketServiceUrl + "/internal/" + ticketId + "/reserve?quantity=" + quantity + "&username=" + username)
                .contentType(MediaType.APPLICATION_JSON)
                .headers(h -> addInternalHeaders(h))
                .exchangeToMono(response -> response.bodyToMono(ResponseErrorTemplate.class))
                .onErrorResume(e -> unavailable(e, "reserve", ticketId));
    }

    public Mono<ResponseErrorTemplate> confirm(Long ticketId, String username) {
        return webClient.post()
                .uri(ticketServiceUrl + "/internal/" + ticketId + "/confirm?username=" + username)
                .headers(h -> addInternalHeaders(h))
                .exchangeToMono(response -> response.bodyToMono(ResponseErrorTemplate.class))
                .onErrorResume(e -> unavailable(e, "confirm", ticketId));
    }

    public Mono<ResponseErrorTemplate> release(Long ticketId, String username) {
        return webClient.post()
                .uri(ticketServiceUrl + "/internal/" + ticketId + "/release?username=" + username)
                .headers(h -> addInternalHeaders(h))
                .exchangeToMono(response -> response.bodyToMono(ResponseErrorTemplate.class))
                .onErrorResume(e -> unavailable(e, "release", ticketId));
    }

    private void addInternalHeaders(org.springframework.http.HttpHeaders headers) {
        headers.set(internalTokenProvider.headerName(), internalTokenProvider.getToken());
        Long tenantId = TenantContextHolder.getTenantId();
        if (tenantId != null) headers.set(TenantContextHolder.TENANT_HEADER, tenantId.toString());
    }

    private Mono<ResponseErrorTemplate> unavailable(Throwable e, String operation, Long ticketId) {
        log.error("Ticket {} failed for ticket {}: {}", operation, ticketId, e.getMessage());
        return Mono.just(new ResponseErrorTemplate("Ticket service unavailable.", "503", new EmptyObject(), true));
    }
}
