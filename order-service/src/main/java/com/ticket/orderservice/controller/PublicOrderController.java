package com.ticket.orderservice.controller;

import com.ticket.common.exception.ApiResponse;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.dto.GuestOrderRequest;
import com.ticket.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public guest checkout. Admin order endpoints remain under /api/v1/orders. */
@RestController
@RequestMapping("/api/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ResponseErrorTemplate> createGuestOrder(
            @Valid @RequestBody GuestOrderRequest request) {
        return ApiResponse.from(orderService.createGuestOrder(request));
    }
}
