package com.ticket.orderservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ApiResponse.from(orderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getOrderById(@PathVariable Long id) {
        return ApiResponse.from(orderService.getOrderById(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(orderService.getStats());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseErrorTemplate> cancelOrder(@PathVariable Long id) {
        return ApiResponse.from(orderService.forceCancelOrder(id));
    }
}
