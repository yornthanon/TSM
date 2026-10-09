package com.ticket.orderservice.dto;

import com.ticket.orderservice.Enum.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderResponse {

    private Long id;
    private Long eventId;
    private Long ticketId;
    private String customerName;
    private String recipientEmail;
    private String phoneNumber;
    private Integer quantity;
    private BigDecimal amount;
    private OrderStatus orderStatus;
    private LocalDateTime orderDate;
    private String paymentId;
    private String qrToken;
    private boolean demoEmailSent;
}
