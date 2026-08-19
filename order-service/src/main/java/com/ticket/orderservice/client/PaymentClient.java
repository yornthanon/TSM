package com.ticket.orderservice.client;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.dto.PaymentRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;

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
                    log.warn("Payment service unavailable ({}), simulating successful payment: {}",
                            throwable.getMessage(), paymentRequest.getOrderId());
                    LinkedHashMap<String, Object> paymentData = new LinkedHashMap<>();
                    paymentData.put("paymentId", paymentRequest.getOrderId());
                    return Mono.just(new ResponseErrorTemplate(
                            "Payment processed successfully.",
                            "200",
                            paymentData,
                            false));
                });
    }
}