package com.ticket.paymentservice.service;


import com.ticket.paymentservice.dto.PaymentRequest;

public interface PaymentGatewayService {

    boolean processPayment(PaymentRequest paymentRequest);
}