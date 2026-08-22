package com.ticket.orderservice.client;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.dto.request.PaymentRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class PaymentClient {

    private final WebClient webClient;

    public PaymentClient(WebClient.Builder webClient) {
        this.webClient = webClient.build();
    }

    @Value("${payment.service.url:http://localhost:8085/api/v1/payments}")
    private String paymentServiceUrl;

    public Mono<ResponseErrorTemplate> processingPayment(PaymentRequest paymentRequest) {
        return webClient.post()
                .uri(paymentServiceUrl + "/process")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(paymentRequest)
                .retrieve()
                .bodyToMono(ResponseErrorTemplate.class)
                .onErrorResume(throwable -> {
                    log.error("Payment service unavailable for order ID {}: {}",
                            paymentRequest.getOrderId(), throwable.getMessage());
                    return Mono.just(new ResponseErrorTemplate(
                            ApiConstant.SERVICE_UNAVAILABLE.getDescription(),
                            ApiConstant.SERVICE_UNAVAILABLE.getKey(),
                            new EmptyObject(),
                            true));
                });
    }
}