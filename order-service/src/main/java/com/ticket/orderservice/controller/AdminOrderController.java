package com.ticket.orderservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ResponseEntity.ok(orderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ResponseEntity.ok(orderService.getStats());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseErrorTemplate> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.forceCancelOrder(id));
    }
}
