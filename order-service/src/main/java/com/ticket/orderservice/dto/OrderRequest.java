package com.ticket.orderservice.dto;

import lombok.Data;
import com.ticket.common.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Data
public class OrderRequest {

    @NotNull
    private Long eventId;
    @NotNull
    private Long ticketId;
    @NotNull
    @Min(1)
    private Integer quantity;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String recipientEmail;
    private String phoneNumber;
    private String idempotencyKey;
}
