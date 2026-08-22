package com.ticket.paymentservice.service;

import com.ticket.common.dto.request.PaymentRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import static com.ticket.common.enums.PaymentMethod.*;

@Slf4j
@Service
public class PaymentGatewayServiceImpl implements PaymentGatewayService{


    @Override
    public boolean processPayment(PaymentRequest paymentRequest) {
        log.info("Processing payment request: {}", paymentRequest.getPaymentMethod());

        try{
            return switch (paymentRequest.getPaymentMethod()) {
                case CREDIT_CARD -> processCreditCardPayment(paymentRequest);
                case PAYPAL -> processPaypalPayment(paymentRequest);
                case BANK_TRANSFER -> processBankTransferPayment(paymentRequest);
                case CASH -> processCashPayment(paymentRequest);
            };
        }catch (Exception e) {
            log.error("Error processing payment: {}", e.getMessage());
            // Here you can throw a custom exception or handle it as needed
            return false;
        }
    }

    private boolean processCreditCardPayment(PaymentRequest paymentRequest) {
        log.info("Processing credit card payment for order ID: {}", paymentRequest.getOrderId());
        // Implement credit card payment processing logic here
        return true; // Return true if successful, false otherwise
    }

    private boolean processPaypalPayment(PaymentRequest paymentRequest) {
        log.info("Processing PayPal payment for order ID: {}", paymentRequest.getOrderId());
        // Implement PayPal payment processing logic here
        return true; // Return true if successful, false otherwise
    }

    private boolean processBankTransferPayment(PaymentRequest paymentRequest) {
        log.info("Processing bank transfer payment for order ID: {}", paymentRequest.getOrderId());
        // Implement bank transfer payment processing logic here
        return true; // Return true if successful, false otherwise
    }

    private boolean processCashPayment(PaymentRequest paymentRequest) {
        log.info("Processing cash payment for order ID: {}", paymentRequest.getOrderId());
        // Implement cash payment processing logic here
        return true; // Return true if successful, false otherwise
    }

}