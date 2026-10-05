package com.ticket.paymentservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ApiResponse.from(paymentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getById(@PathVariable Long id) {
        return ApiResponse.from(paymentService.getById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(paymentService.getRevenueSummary());
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ResponseErrorTemplate> getByTransactionId(@PathVariable String transactionId) {
        return ApiResponse.from(paymentService.getByTransactionId(transactionId));
    }
}
