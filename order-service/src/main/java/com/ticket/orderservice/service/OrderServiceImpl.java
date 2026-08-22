package com.ticket.orderservice.service;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.Enum.OrderStatus;
import com.ticket.common.enums.PaymentMethod;
import com.ticket.orderservice.Mapper.OrderMapper;
import com.ticket.orderservice.client.PaymentClient;
import com.ticket.orderservice.client.UserClient;
import com.ticket.common.dto.event.OrderConfirmedEvent;
import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.common.dto.request.PaymentRequest;
import com.ticket.orderservice.entity.Order;
import com.ticket.orderservice.Producer.OrderConfirmedKafkaProducer;
import com.ticket.orderservice.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Optional;

@Service
@Slf4j
public class OrderServiceImpl implements OrderService{

    private final OrderMapper orderMapper;
    private final UserClient userClient;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepository;
    private final OrderConfirmedKafkaProducer orderConfirmedKafkaProducer;

    public OrderServiceImpl(OrderMapper orderMapper,
                            UserClient userClient, PaymentClient paymentClient,
                            OrderRepository orderRepository,
                            OrderConfirmedKafkaProducer orderConfirmedKafkaProducer) {
        this.orderMapper = orderMapper;
        this.userClient = userClient;
        this.paymentClient = paymentClient;
        this.orderRepository = orderRepository;
        this.orderConfirmedKafkaProducer = orderConfirmedKafkaProducer;
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
        // Payment processing logic would go here

        // Create order in the database
        Order order = orderMapper.toEntity(orderRequest);
        order.setEventId(orderRequest.getEventId()); // need to check event service
        order.setTicketId(orderRequest.getTicketId()); // need to check ticket service
        order.setUsername(username);
        order.setOrderStatus(OrderStatus.PROCESSING);
        order.setOrderDate(LocalDateTime.now());

        orderRepository.save(order);

        // Process payment: can move to new method or service
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(order.getId());
        paymentRequest.setUsername(username);
        paymentRequest.setAmount(orderRequest.getAmount());
        paymentRequest.setCurrency("USD");
        paymentRequest.setPaymentMethod(PaymentMethod.CREDIT_CARD);
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

        // Send order confirmed event to Kafka
        OrderConfirmedEvent orderConfirmedEvent = new OrderConfirmedEvent();
        orderConfirmedEvent.setOrderId(order.getId());
        orderConfirmedEvent.setUsername(order.getUsername());
        orderConfirmedEvent.setEmail("codestorykh@gmail.com"); // need to get from user service
        orderConfirmedEvent.setPhoneNumber("0123456789"); // need to get from user service
        orderConfirmedEvent.setEventTitle(orderRequest.getEventId().toString()); // need to get from event service
        orderConfirmedEvent.setEventLocation(orderRequest.getEventId().toString()); // need to get from event service
        orderConfirmedEvent.setEventDate(LocalDateTime.now());
        orderConfirmedEvent.setQuantity(orderRequest.getQuantity());
        orderConfirmedEvent.setAmount(orderRequest.getAmount());

        orderConfirmedKafkaProducer.send(orderConfirmedEvent);

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
}