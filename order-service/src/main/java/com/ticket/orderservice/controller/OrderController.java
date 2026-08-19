package com.ticket.orderservice.controller;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.orderservice.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<ResponseErrorTemplate> createOrder(@Valid @RequestBody OrderRequest request,
                                                             HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(orderService.createOrder(request, httpServletRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseErrorTemplate> cancelOrder(@PathVariable Long id,
                                                             HttpServletRequest httpServletRequest) {
        return ResponseEntity.ok(orderService.cancelOrder(id, httpServletRequest));
    }
}