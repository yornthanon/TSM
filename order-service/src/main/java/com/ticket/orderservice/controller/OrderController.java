package com.ticket.orderservice.controller;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.common.exception.ApiResponse;
import com.ticket.orderservice.client.UserClient;
import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.orderservice.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;

@RestController
@Slf4j
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserClient userClient;

    @PostMapping({"", "/create"})
    public ResponseEntity<ResponseErrorTemplate> createOrder(@Valid @RequestBody OrderRequest request,
                                                             HttpServletRequest httpServletRequest) {
        return ApiResponse.from(orderService.createOrder(request, httpServletRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> getOrderById(@PathVariable Long id) {
        return ApiResponse.from(orderService.getOrderById(id));
    }

    @GetMapping("/user/me")
    public ResponseEntity<ResponseErrorTemplate> getMyOrders(HttpServletRequest httpServletRequest) {
        String username = handleUnauthorized(httpServletRequest);
        if (!StringUtils.hasText(username)) {
            return ApiResponse.from(new ResponseErrorTemplate(
                    ApiConstant.UN_AUTHORIZATION.getDescription(),
                    ApiConstant.UN_AUTHORIZATION.getKey(),
                    new EmptyObject(),
                    true));
        }
        return ApiResponse.from(orderService.findByUsername(username));
    }

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        return ApiResponse.from(orderService.findAll());
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        return ApiResponse.from(orderService.getStats());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseErrorTemplate> cancelOrder(@PathVariable Long id,
                                                             HttpServletRequest httpServletRequest) {
        return ApiResponse.from(orderService.cancelOrder(id, httpServletRequest));
    }

    @PutMapping("/{id}/force-cancel")
    public ResponseEntity<ResponseErrorTemplate> forceCancelOrder(@PathVariable Long id) {
        return ApiResponse.from(orderService.forceCancelOrder(id));
    }

    private String handleUnauthorized(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        var user = userClient.verifyToken(token)
                .blockOptional()
                .orElseThrow(() -> new RuntimeException("Invalid token"));
        if (user != null && "TOKEN_VALID".equalsIgnoreCase(user.getCode())) {
            return user.getData().get("username").toString();
        }
        log.warn("Invalid token provided");
        return null;
    }
}
