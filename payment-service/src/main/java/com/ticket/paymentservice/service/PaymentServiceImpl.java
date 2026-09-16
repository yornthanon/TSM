package com.ticket.paymentservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.enums.PaymentStatus;
import com.ticket.common.dto.request.PaymentRequest;
import com.ticket.paymentservice.dto.PaymentResponse;
import com.ticket.paymentservice.entity.Payment;
import com.ticket.paymentservice.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Override
    public ResponseErrorTemplate findAll() {
        List<PaymentResponse> payments = paymentRepository.findAll().stream()
                .map(this::mapToPaymentResponse)
                .toList();
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                payments,
                false);
    }

    @Override
    public ResponseErrorTemplate getRevenueSummary() {
        List<Payment> payments = paymentRepository.findAll();

        java.math.BigDecimal totalRevenue = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        Map<String, Long> byStatus = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getPaymentStatus().name(), Collectors.counting()));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalTransactions", payments.size());
        summary.put("totalRevenue", totalRevenue);
        summary.put("byStatus", byStatus);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                summary,
                false);
    }

    @Override
    public ResponseErrorTemplate getById(Long paymentId) {
        Optional<Payment> payment = paymentRepository.findById(paymentId);
        if (payment.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.DATA_NOT_FOUND.getFormattedDescription(paymentId),
                    ApiConstant.DATA_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        PaymentResponse response = mapToPaymentResponse(payment.get());
        response.setTransactionId(payment.get().getTransactionId());
        response.setPaymentId(payment.get().getId());
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                response,
                false);
    }

    @Override
    public ResponseErrorTemplate getByTransactionId(String transactionId) {
        Optional<Payment> payment = paymentRepository.findByTransactionId(transactionId);
        if (payment.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.DATA_NOT_FOUND.getFormattedDescription(transactionId),
                    ApiConstant.DATA_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        PaymentResponse response = mapToPaymentResponse(payment.get());
        response.setTransactionId(payment.get().getTransactionId());
        response.setPaymentId(payment.get().getId());
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                response,
                false);
    }

    @Override
    public ResponseErrorTemplate refund(Long paymentId) {
        Optional<Payment> payment = paymentRepository.findById(paymentId);
        if (payment.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.DATA_NOT_FOUND.getFormattedDescription(paymentId),
                    ApiConstant.DATA_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        if (payment.get().getPaymentStatus() != PaymentStatus.COMPLETED) {
            return new ResponseErrorTemplate(
                    ApiConstant.PAYMENT_NOT_REFUNDABLE.getFormattedDescription(paymentId),
                    ApiConstant.PAYMENT_NOT_REFUNDABLE.getKey(),
                    new EmptyObject(),
                    true);
        }

        log.info("Mock gateway refund requested for transaction [{}]",
                payment.get().getTransactionId());
        payment.get().setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment.get());

        return new ResponseErrorTemplate(
                ApiConstant.PAYMENT_REFUND_SUCCESS.getFormattedDescription(paymentId),
                ApiConstant.PAYMENT_REFUND_SUCCESS.getKey(),
                mapToPaymentResponse(payment.get()),
                false);
    }
}
