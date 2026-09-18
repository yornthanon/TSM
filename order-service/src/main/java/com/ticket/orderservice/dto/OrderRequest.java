package com.ticket.orderservice.dto;

import lombok.Data;
import com.ticket.common.enums.PaymentMethod;

import java.math.BigDecimal;

@Data
public class OrderRequest {

    private Long eventId;
    private Long ticketId;
    private Integer quantity;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String recipientEmail;
    private String phoneNumber;
}