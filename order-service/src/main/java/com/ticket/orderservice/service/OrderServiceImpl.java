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
import com.ticket.orderservice.client.TicketClient;
import com.ticket.orderservice.client.UserClient;
import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.common.dto.request.PaymentRequest;
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
    private final TicketClient ticketClient;
    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderMapper orderMapper,
                            UserClient userClient, EventClient eventClient, PaymentClient paymentClient,
                            TicketClient ticketClient,
                            OrderRepository orderRepository) {
        this.orderMapper = orderMapper;
        this.userClient = userClient;
        this.eventClient = eventClient;
        this.paymentClient = paymentClient;
        this.ticketClient = ticketClient;
        this.orderRepository = orderRepository;
    }

    @Override
    public ResponseErrorTemplate createOrder(OrderRequest orderRequest, HttpServletRequest httpServletRequest) {
        String username = handleUnauthorized(httpServletRequest);
        if(!StringUtils.hasText(username)) {
            return new ResponseErrorTemplate(
                    ApiConstant.UN_AUTHORIZATION.getDescription(),
                    ApiConstant.UN_AUTHORIZATION.getKey(),
                    new EmptyObject(),
                    true);
        }

        if (orderRequest.getQuantity() == null || orderRequest.getQuantity() != 1) {
            return new ResponseErrorTemplate("Only one seat per checkout is supported.",
                    ApiConstant.INVALID_REQUEST.getKey(), new EmptyObject(), true);
        }
        if (StringUtils.hasText(orderRequest.getIdempotencyKey())) {
            Optional<Order> existing = orderRepository.findByUsernameAndIdempotencyKey(username,
                    orderRequest.getIdempotencyKey().trim());
            if (existing.isPresent()) {
                return new ResponseErrorTemplate(ApiConstant.SUCCESS.getDescription(), ApiConstant.SUCCESS.getKey(),
                        orderMapper.toResponse(existing.get()), false);
            }
        }

        ResponseErrorTemplate reservation = ticketClient.reserve(orderRequest.getTicketId(),
                orderRequest.getQuantity(), username).block();
        if (reservation == null || reservation.isError() || !(reservation.data() instanceof Map<?, ?> ticketData)) {
            return reservation == null ? new ResponseErrorTemplate("Ticket reservation failed.", "409", new EmptyObject(), true) : reservation;
        }
        Object reservedEvent = ticketData.get("eventId");
        Object rawPrice = ticketData.get("price");
        BigDecimal unitPrice = rawPrice == null ? null : new BigDecimal(rawPrice.toString());
        if (unitPrice == null || (reservedEvent != null && !String.valueOf(orderRequest.getEventId()).equals(String.valueOf(reservedEvent)))) {
            ticketClient.release(orderRequest.getTicketId(), username).block();
            return new ResponseErrorTemplate("Ticket does not belong to the requested event.",
                    ApiConstant.INVALID_REQUEST.getKey(), new EmptyObject(), true);
        }
        BigDecimal serverAmount = unitPrice.multiply(BigDecimal.valueOf(orderRequest.getQuantity()));
        if (orderRequest.getAmount() != null && orderRequest.getAmount().compareTo(serverAmount) != 0) {
            ticketClient.release(orderRequest.getTicketId(), username).block();
            return new ResponseErrorTemplate("Order amount does not match the ticket price.",
                    ApiConstant.INVALID_REQUEST.getKey(), new EmptyObject(), true);
        }

        Order order = orderMapper.toEntity(orderRequest);
        order.setEventId(orderRequest.getEventId());
        order.setTicketId(orderRequest.getTicketId());
        order.setUsername(username);
        order.setAmount(serverAmount);
        order.setIdempotencyKey(StringUtils.hasText(orderRequest.getIdempotencyKey())
                ? orderRequest.getIdempotencyKey().trim() : null);
        order.setOrderStatus(OrderStatus.PROCESSING);
        order.setOrderDate(LocalDateTime.now());

        orderRepository.save(order);

        // Process payment
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setOrderId(order.getId());
        paymentRequest.setUsername(username);
        paymentRequest.setAmount(serverAmount);
        paymentRequest.setCurrency("USD");
        paymentRequest.setPaymentMethod(orderRequest.getPaymentMethod() != null ? orderRequest.getPaymentMethod() : PaymentMethod.CREDIT_CARD);
        paymentRequest.setDescription("Payment for order ID: " + order.getId());

        ResponseErrorTemplate paymentResponse = paymentClient.processingPayment(paymentRequest)
                .block();

        if(paymentResponse == null || paymentResponse.isError()) {
            log.error("Payment processing failed for order ID: {}", order.getId());
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            ticketClient.release(orderRequest.getTicketId(), username).block();
            return new ResponseErrorTemplate(
                    ApiConstant.PAYMENT_FAILED.getDescription(),
                    ApiConstant.PAYMENT_FAILED.getKey(),
                    new EmptyObject(),
                    true);
        }

        Long paymentId = paymentIdFrom(paymentResponse.data());
        order.setPaymentId(paymentId);
        ResponseErrorTemplate sale = ticketClient.confirm(orderRequest.getTicketId(), username).block();
        if (sale == null || sale.isError()) {
            if (paymentId != null) paymentClient.refund(paymentId).block();
            order.setOrderStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            ticketClient.release(orderRequest.getTicketId(), username).block();
            return new ResponseErrorTemplate("Ticket sale could not be confirmed; payment was reversed.",
                    "409", new EmptyObject(), true);
        }
        order.setOrderStatus(OrderStatus.COMPLETED);
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
        String username = handleUnauthorized(httpServletRequest);
        if (!StringUtils.hasText(username)) {
            return new ResponseErrorTemplate(ApiConstant.UN_AUTHORIZATION.getDescription(),
                    ApiConstant.UN_AUTHORIZATION.getKey(), new EmptyObject(), true);
        }
        Optional<Order> order = orderRepository.findById(orderId);
        if(order.isEmpty()) {
            return new ResponseErrorTemplate(
                    ApiConstant.DATA_NOT_FOUND.getFormattedDescription(orderId),
                    ApiConstant.DATA_NOT_FOUND.getKey(),
                    new EmptyObject(),
                    true);
        }
        if (!username.equals(order.get().getUsername())) {
            return new ResponseErrorTemplate("You can only cancel your own order.", "403",
                    new EmptyObject(), true);
        }
        return cancelExistingOrder(order.get(), username);
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
        // orderStatus is nullable until the service assigns one.
        Map<String, Long> byStatus = orders.stream()
                .filter(o -> o.getOrderStatus() != null)
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

        return cancelExistingOrder(order.get(), "admin");
    }

    private ResponseErrorTemplate cancelExistingOrder(Order order, String actor) {
        ResponseErrorTemplate statusCheck = validateCancellable(order);
        if (statusCheck != null) return statusCheck;

        if (order.getPaymentId() != null) {
            ResponseErrorTemplate refund = paymentClient.refund(order.getPaymentId()).block();
            if (refund == null || refund.isError()) {
                return new ResponseErrorTemplate(
                        "Cancellation is blocked because the payment could not be refunded.",
                        "409", new EmptyObject(), true);
            }
        }
        if (order.getTicketId() != null && StringUtils.hasText(order.getUsername())) {
            ResponseErrorTemplate release = ticketClient.release(order.getTicketId(), order.getUsername()).block();
            if (release == null || release.isError()) {
                return new ResponseErrorTemplate(
                        "Cancellation is blocked because the ticket reservation could not be released.",
                        "409", new EmptyObject(), true);
            }
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setUpdatedBy(actor);
        orderRepository.save(order);
        return new ResponseErrorTemplate(ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(), orderMapper.toResponse(order), false);
    }

    private Long paymentIdFrom(Object paymentData) {
        if (paymentData instanceof Map<?, ?> data) {
            Object value = data.get("paymentId");
            if (value instanceof Number number) return number.longValue();
            if (value != null) {
                try { return Long.valueOf(value.toString()); } catch (NumberFormatException ignored) { }
            }
        }
        return null;
    }

    private ResponseErrorTemplate validateCancellable(Order order) {
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return new ResponseErrorTemplate(
                    "Order is already cancelled.",
                    ApiConstant.INVALID_REQUEST.getKey(),
                    orderMapper.toResponse(order),
                    true);
        }
        if (order.getOrderStatus() != OrderStatus.PENDING
                && order.getOrderStatus() != OrderStatus.PROCESSING) {
            return new ResponseErrorTemplate(
                    "Only pending or processing orders can be cancelled.",
                    ApiConstant.INVALID_REQUEST.getKey(),
                    orderMapper.toResponse(order),
                    true);
        }
        return null;
    }
}
