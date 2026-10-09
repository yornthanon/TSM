package com.ticket.orderservice.service;

import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.orderservice.dto.GuestOrderRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface OrderService {

    ResponseErrorTemplate createOrder(OrderRequest orderRequest, HttpServletRequest httpServletRequest);
    ResponseErrorTemplate createGuestOrder(GuestOrderRequest request);
    ResponseErrorTemplate getOrderById(Long orderId);
    ResponseErrorTemplate cancelOrder(Long orderId, HttpServletRequest httpServletRequest);
    ResponseErrorTemplate findAll();
    ResponseErrorTemplate getStats();
    ResponseErrorTemplate forceCancelOrder(Long orderId);
    ResponseErrorTemplate findByUsername(String username);

}
