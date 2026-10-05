package com.ticket.ticketservice.client;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.common.tenant.TenantContextHolder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration("ticketEventClient")
public class EventClient {

    private final WebClient webClient;
    private final InternalTokenProvider internalTokenProvider;

    public EventClient(WebClient.Builder webClientBuilder, InternalTokenProvider internalTokenProvider) {
        this.webClient = webClientBuilder.build();
        this.internalTokenProvider = internalTokenProvider;
    }

    @Value("${event.service.url}")
    private String eventServiceUrl;

    public ResponseErrorTemplate getEventById(Long eventId) {
        return webClient.get()
                .uri(eventServiceUrl+"/{id}", eventId)
                .header("Accept", "application/json")
                .header(internalTokenProvider.headerName(), internalTokenProvider.getToken())
                .header(TenantContextHolder.TENANT_HEADER, tenantHeaderValue())
                .retrieve()
                .bodyToMono(ResponseErrorTemplate.class)
                .block();
    }

    private String tenantHeaderValue() {
        Long tenantId = TenantContextHolder.getTenantId();
        return tenantId == null ? "" : tenantId.toString();
    }
}
