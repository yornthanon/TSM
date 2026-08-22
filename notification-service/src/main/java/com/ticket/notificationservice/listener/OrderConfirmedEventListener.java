package com.ticket.notificationservice.listener;

import com.ticket.common.dto.event.OrderConfirmedEvent;
import com.ticket.notificationservice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@Slf4j
public class OrderConfirmedEventListener {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    public OrderConfirmedEventListener(NotificationService notificationService, ObjectMapper objectMapper) {
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${notification.topic.order-confirmed}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderConfirmedEvent(String message) {
        try{
            log.info("Received order confirmed event: {}", message);
            OrderConfirmedEvent orderConfirmedEvent = objectMapper.readValue(message, OrderConfirmedEvent.class);
            notificationService.handlerOrderConfirmationEvent(orderConfirmedEvent);
            log.info("Successfully processed order confirmed event: {}", orderConfirmedEvent);
        }catch (Exception ex){
            log.error("Error parsing order confirmed event: {}", message, ex);
        }
    }
}