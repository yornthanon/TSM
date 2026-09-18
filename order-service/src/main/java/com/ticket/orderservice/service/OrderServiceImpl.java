package com.ticket.orderservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.dto.OrderResponse;
import com.ticket.orderservice.entity.Order;
import com.ticket.orderservice.Enum.OrderStatus;
import com.ticket.common.enums.PaymentMethod;
import com.ticket.orderservice.Mapper.OrderMapper;
import com.ticket.orderservice.client.EventClient;
import com.ticket.orderservice.client.PaymentClient;
import com.ticket.orderservice.client.UserClient;
import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.common.dto.request.PaymentRequest;
import com.ticket.orderservice.entity.Order;
import com.ticket.orderservice.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@Slf4j
public class OrderServiceImpl implements OrderService{

    private final OrderMapper orderMapper;
    private final UserClient userClient;
    private final EventClient eventClient;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderMapper orderMapper,
                            UserClient userClient, EventClient eventClient, PaymentClient paymentClient,
                            OrderRepository orderRepository) {
        this.orderMapper = orderMapper;
        this.userClient = userClient;
        this.eventClient = eventClient;
        this.paymentClient = paymentClient;
        this.orderRepository = orderRepository;
    }

    @Override
    public ResponseErrorTemplate createOrder(OrderRequest orderRequest, HttpServletRequest httpServletRequest) {
        // Check user authentication and authorization
        String username = handleUnauthorized(httpServletRequest);
        if(!StringUtils.hasText(username)) {
            return new ResponseErrorTemplate(
                    ApiConstant.UN_AUTHORIZATION.getDescription(),
                    ApiConstant.UN_AUTHORIZATION.getKey(),
                    new EmptyObject(),
                    true);
        }

        // Create order in the database
        Order order = orderMapper.toEntity(orderRequest);
        order.setEventId(orderRequest.getEventId());
        order.setTicketId(orderRequest.getTicketId());
        order.setUsername(username);
        order.setOrderStatus(OrderStatus.PROCESSING);
        order.setOrderDate(LocalDateTime.now());

        orderRepository.save(order);

        // Process payment
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(order.getId());
        paymentRequest.setUsername(username);
        paymentRequest.setAmount(orderRequest.getAmount());
        paymentRequest.setCurrency("USD");
        paymentRequest.setPaymentMethod(orderRequest.getPaymentMethod() != null ? orderRequest.getPaymentMethod() : PaymentMethod.CREDIT_CARD);
        paymentRequest.setDescription("Payment for order ID: " + order.getId());

        ResponseErrorTemplate paymentResponse = paymentClient.processingPayment(paymentRequest)
                .block();

        if(paymentResponse == null || paymentResponse.isError()) {
            log.error("Payment processing failed for order ID: {}", order.getId());
            return new ResponseErrorTemplate(
                    ApiConstant.PAYMENT_FAILED.getDescription(),
                    ApiConstant.PAYMENT_FAILED.getKey(),
                    new EmptyObject(),
                    true);
        }

        order.setOrderStatus(OrderStatus.COMPLETED);
        Object rawPaymentId = ((LinkedHashMap<?, ?>) paymentResponse.data()).get("paymentId");
        Long paymentId = rawPaymentId != null ? ((Number) rawPaymentId).longValue() : null;
        order.setPaymentId(paymentId);
        orderRepository.save(order);

        // Publish Kafka event for notification service
        try {
            Map eventData = eventClient.getEventById(orderRequest.getEventId()).block();
            
            String eventTitle = "Event #" + orderRequest.getEventId();
            String eventLocation = "";
            LocalDateTime eventDate = LocalDateTime.now();
            
            if (eventData != null && eventData.get("data") instanceof Map data) {
                Object titleObj = data.get("title");
                Object locObj = data.get("location");
                Object dateObj = data.get("eventDate");
                if (titleObj != null) eventTitle = titleObj.toString();
                if (locObj != null) eventLocation = locObj.toString();
                if (dateObj != null) {
                    try {
                        eventDate = LocalDateTime.parse(dateObj.toString());
                    } catch (Exception ignored) {
                    }
                }
            }

            // Use email/phone from request (frontend provides these) or fallback to user service
            String email = orderRequest.getRecipientEmail();
            String phoneNumber = orderRequest.getPhoneNumber();
            
            if (!StringUtils.hasText(email) || !StringUtils.hasText(phoneNumber)) {
                Map userData = userClient.getUserByUsername(username).block();
                if (userData != null && userData.get("data") instanceof Map data) {
                    if (!StringUtils.hasText(email)) {
                        Object emailObj = data.get("email");
                        if (emailObj != null) email = emailObj.toString();
                    }
                    if (!StringUtils.hasText(phoneNumber)) {
                        Object phoneObj = data.get("phoneNumber");
                        if (phoneObj != null) phoneNumber = phoneObj.toString();
                    }
                }
            }

            // TODO: Publish Kafka event to order-confirmed-topic
            // orderConfirmedKafkaProducer.sendOrderConfirmedEvent(order, email, phoneNumber, eventTitle, eventLocation, eventDate);
            
        } catch (Exception e) {
            log.error("Failed to prepare notification data for order {}: {}", order.getId(), e.getMessage());
        }

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                orderMapper.toResponse(order),
                false);
    }

    @Override
    public ResponseErrorTemplate getOrderById(Long orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        return order.map(value -> new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                orderMapper.toResponse(value),
                false)).orElseGet(() -> new ResponseErrorTemplate(
                        ApiConstant.DATA_NOT_FOUND.getFormattedDescription(orderId),
                        ApiConstant.DATA_NOT_FOUND.getKey(),
                        new EmptyObject(),
                        true));
    }

    @Override
    public ResponseErrorTemplate cancelOrder(Long orderId, HttpServletRequest httpServletRequest) {
        // Check user authentication and authorization
        String username = handleUnauthorized(httpServletRequest);
        Optional<Order> order = orderRepository.findById(orderId);
        if(order.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.DATA_NOT_FOUND.getFormattedDescription(orderId),
                    ApiConstant.DATA_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        order.get().setOrderStatus(OrderStatus.CANCELLED);
        order.get().setUpdatedBy(username);
        orderRepository.save(order.get());

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                new EmptyObject(),
                false);
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
       if(user != null && "TOKEN_VALID".equalsIgnoreCase(user.getCode())) {
            return user.getData().get("username").toString();
       }
    log.warn("Invalid token provided");
    return null;
    }

    @Override
    public ResponseErrorTemplate findAll() {
        List<OrderResponse> orders = orderRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                orders,
                false);
    }

    @Override
    public ResponseErrorTemplate getStats() {
        List<Order> orders = orderRepository.findAll();
        Map<String, Long> byStatus = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getOrderStatus().name(), Collectors.counting()));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", orders.size());
        stats.put("byStatus", byStatus);
        stats.put("totalAmount", orders.stream()
                .map(Order::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                stats,
                false);
    }

    @Override
    public ResponseErrorTemplate forceCancelOrder(Long orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.DATA_NOT_FOUND.getFormattedDescription(orderId),
                    ApiConstant.DATA_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }

        Order existing = order.get();
        existing.setOrderStatus(OrderStatus.CANCELLED);
        existing.setUpdatedBy("admin");
        orderRepository.save(existing);

        return new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                orderMapper.toResponse(existing),
                false);
    }
}
