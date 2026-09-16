package com.ticket.paymentservice.service;


import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.dto.request.PaymentRequest;

public interface PaymentService {    // get by transaction id
    // get by payment id

    // refund payment

    ResponseErrorTemplate processPayment(PaymentRequest paymentRequest);

    ResponseErrorTemplate findAll();

    ResponseErrorTemplate getRevenueSummary();

    ResponseErrorTemplate getById(Long paymentId);

    ResponseErrorTemplate getByTransactionId(String transactionId);

    ResponseErrorTemplate refund(Long paymentId);

}