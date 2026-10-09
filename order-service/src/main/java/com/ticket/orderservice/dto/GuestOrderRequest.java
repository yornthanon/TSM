package com.ticket.orderservice.dto;

import com.ticket.common.enums.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Payload accepted by the public, guest checkout endpoint. */
@Data
public class GuestOrderRequest {
    @NotBlank
    private String shareToken;
    @NotNull
    private Long ticketId;
    @NotNull
    @Min(1)
    private Integer quantity;
    @NotBlank
    private String customerName;
    @NotBlank
    @Email
    private String recipientEmail;
    @NotBlank
    private String phoneNumber;
    private PaymentMethod paymentMethod;
    private String idempotencyKey;
}
