package com.ticket.paymentservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.dto.request.PaymentRequest;
import com.ticket.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<ResponseErrorTemplate> process(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ResponseEntity.ok(paymentService.findAll());
    }

    @GetMapping("/revenue-summary")
    public ResponseEntity<ResponseErrorTemplate> getRevenueSummary() {
        return ResponseEntity.ok(paymentService.getRevenueSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ResponseErrorTemplate> getByTransactionId(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getByTransactionId(transactionId));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ResponseErrorTemplate> refund(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.refund(id));
    }
}
