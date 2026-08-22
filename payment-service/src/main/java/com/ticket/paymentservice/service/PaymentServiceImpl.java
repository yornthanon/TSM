package com.ticket.paymentservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.enums.PaymentStatus;
import com.ticket.common.dto.request.PaymentRequest;
import com.ticket.paymentservice.dto.PaymentResponse;
import com.ticket.paymentservice.entity.Payment;
import com.ticket.paymentservice.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class PaymentServiceImpl implements PaymentService{

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayService paymentGatewayService;

    public PaymentServiceImpl(PaymentRepository paymentRepository, PaymentGatewayService paymentGatewayService) {
        this.paymentRepository = paymentRepository;
        this.paymentGatewayService = paymentGatewayService;
    }

    @Override
    public ResponseErrorTemplate processPayment(PaymentRequest paymentRequest) {
        Payment payment = mapToPayment(paymentRequest);
        payment.setPaymentStatus(PaymentStatus.FAILED);

        boolean paymentSuccess = paymentGatewayService.processPayment(paymentRequest);

        if(!paymentSuccess) {
            paymentRepository.save(payment);
            return new ResponseErrorTemplate(
                    ApiConstant.PAYMENT_FAILED.getFormattedDescription(paymentRequest.getOrderId()),
                    ApiConstant.PAYMENT_FAILED.getKey(),
                    mapToPaymentResponse(payment),
                    true);
        }

        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(paymentRequest.getUsername()+"_"+ UUID.randomUUID());
        paymentRepository.save(payment);

        PaymentResponse paymentResponse = mapToPaymentResponse(payment);
        paymentResponse.setTransactionId(payment.getTransactionId());
        paymentResponse.setPaymentId(payment.getId());
        paymentResponse.setOrderId(paymentRequest.getOrderId());

        return new ResponseErrorTemplate(
                ApiConstant.PAYMENT_SUCCESS.getFormattedDescription(paymentRequest.getOrderId()),
                ApiConstant.PAYMENT_SUCCESS.getKey(),
                paymentResponse,
                false);
    }


    private Payment mapToPayment(PaymentRequest paymentRequest) {
        return Payment.builder()
                .username(paymentRequest.getUsername())
                .orderId(paymentRequest.getOrderId())
                .amount(paymentRequest.getAmount())
                .currency(paymentRequest.getCurrency())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .description(paymentRequest.getDescription())
                .paymentDate(LocalDateTime.now())
                .build();
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}