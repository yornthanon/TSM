package com.ticket.paymentservice.service;


import com.ticket.common.dto.request.PaymentRequest;

public interface PaymentGatewayService {

    boolean processPayment(PaymentRequest paymentRequest);
}