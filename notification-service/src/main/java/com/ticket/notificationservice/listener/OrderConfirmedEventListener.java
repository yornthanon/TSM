package com.ticket.notificationservice.listener;

import com.ticket.common.dto.event.OrderConfirmedEvent;
import com.ticket.notificationservice.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
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
    public void handleOrderConfirmedEvent(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        try {
            log.info("Received order confirmed event: topic={}, partition={}, offset={}", topic, partition, offset);
            OrderConfirmedEvent orderConfirmedEvent = objectMapper.readValue(message, OrderConfirmedEvent.class);
            notificationService.handlerOrderConfirmationEvent(orderConfirmedEvent);
            log.info("Successfully processed order confirmed event: {}", orderConfirmedEvent);
            acknowledgment.acknowledge();
        } catch (Exception ex) {
            log.error("Error processing order confirmed event: {}. Message will NOT be acknowledged and may be redelivered.", message, ex);
            // Do NOT acknowledge — the record will be redelivered (or sent to DLQ if configured).
        }
    }
}
