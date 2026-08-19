package com.ticket.orderservice.dto;

import com.ticket.orderservice.Enum.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {

    private Long orderId;
    private String username;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private String description;
}