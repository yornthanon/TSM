package com.ticket.common.dto.request;

import com.ticket.common.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {

    private Long orderId;
    private String username;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private String description;
}
