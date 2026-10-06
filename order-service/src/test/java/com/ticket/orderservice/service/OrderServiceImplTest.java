package com.ticket.orderservice.service;

import com.ticket.common.dto.TokenVerificationResponse;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.orderservice.Mapper.OrderMapper;
import com.ticket.orderservice.client.EventClient;
import com.ticket.orderservice.client.PaymentClient;
import com.ticket.orderservice.client.TicketClient;
import com.ticket.orderservice.client.UserClient;
import com.ticket.orderservice.dto.OrderRequest;
import com.ticket.orderservice.entity.Order;
import com.ticket.orderservice.Enum.OrderStatus;
import com.ticket.orderservice.repository.OrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {
    @Mock private OrderMapper orderMapper;
    @Mock private UserClient userClient;
    @Mock private EventClient eventClient;
    @Mock private PaymentClient paymentClient;
    @Mock private TicketClient ticketClient;
    @Mock private OrderRepository orderRepository;
    @Mock private HttpServletRequest httpRequest;
    private OrderServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new OrderServiceImpl(orderMapper, userClient, eventClient, paymentClient, ticketClient, orderRepository);
    }

    @Test
    void paymentFailureCancelsOrderAndReleasesReservation() {
        when(httpRequest.getHeader("Authorization")).thenReturn("Bearer valid-token");
        TokenVerificationResponse verified = new TokenVerificationResponse();
        verified.setCode("TOKEN_VALID");
        verified.setData(Map.of("username", "buyer"));
        when(userClient.verifyToken("valid-token")).thenReturn(Mono.just(verified));

        OrderRequest request = new OrderRequest();
        request.setEventId(20L);
        request.setTicketId(21L);
        request.setQuantity(1);
        request.setAmount(BigDecimal.TEN);

        ResponseErrorTemplate reservation = new ResponseErrorTemplate(
                "reserved", "SUCCESS", Map.of("eventId", 20L, "price", "10.00"), false);
        when(ticketClient.reserve(21L, 1, "buyer")).thenReturn(Mono.just(reservation));
        Order order = new Order();
        order.setId(99L);
        when(orderMapper.toEntity(request)).thenReturn(order);
        when(paymentClient.processingPayment(any())).thenReturn(Mono.just(
                new ResponseErrorTemplate("declined", "PAYMENT_FAILED", Map.of(), true)));
        when(ticketClient.release(21L, "buyer")).thenReturn(Mono.just(
                new ResponseErrorTemplate("released", "SUCCESS", null, false)));

        ResponseErrorTemplate response = service.createOrder(request, httpRequest);

        assertThat(response.isError()).isTrue();
        assertThat(response.code()).isEqualTo("400");
        assertThat(order.getOrderStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(orderRepository, atLeastOnce()).save(order);
        verify(ticketClient).release(21L, "buyer");
        verify(ticketClient, never()).confirm(any(), any());
    }

    @Test
    void forceCancelRejectsCompletedOrder() {
        Order order = new Order();
        order.setId(100L);
        order.setOrderStatus(OrderStatus.COMPLETED);
        when(orderRepository.findById(100L)).thenReturn(java.util.Optional.of(order));

        ResponseErrorTemplate response = service.forceCancelOrder(100L);

        assertThat(response.isError()).isTrue();
        assertThat(response.code()).isEqualTo("400");
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void ownerCancellationRefundsPaymentReleasesSeatAndCancelsOrder() {
        when(httpRequest.getHeader("Authorization")).thenReturn("Bearer valid-token");
        TokenVerificationResponse verified = new TokenVerificationResponse();
        verified.setCode("TOKEN_VALID");
        verified.setData(Map.of("username", "buyer"));
        when(userClient.verifyToken("valid-token")).thenReturn(Mono.just(verified));
        Order order = order(101L, "buyer", 202L, 303L, OrderStatus.PROCESSING);
        when(orderRepository.findById(101L)).thenReturn(java.util.Optional.of(order));
        when(paymentClient.refund(303L)).thenReturn(Mono.just(success("refunded")));
        when(ticketClient.release(202L, "buyer")).thenReturn(Mono.just(success("released")));

        ResponseErrorTemplate response = service.cancelOrder(101L, httpRequest);

        assertThat(response.isError()).isFalse();
        assertThat(order.getOrderStatus()).isEqualTo(OrderStatus.CANCELLED);
        verify(paymentClient).refund(303L);
        verify(ticketClient).release(202L, "buyer");
        verify(orderRepository).save(order);
    }

    @Test
    void userCannotCancelAnotherUsersOrder() {
        when(httpRequest.getHeader("Authorization")).thenReturn("Bearer valid-token");
        TokenVerificationResponse verified = new TokenVerificationResponse();
        verified.setCode("TOKEN_VALID");
        verified.setData(Map.of("username", "attacker"));
        when(userClient.verifyToken("valid-token")).thenReturn(Mono.just(verified));
        Order order = order(102L, "owner", 202L, null, OrderStatus.PROCESSING);
        when(orderRepository.findById(102L)).thenReturn(java.util.Optional.of(order));

        ResponseErrorTemplate response = service.cancelOrder(102L, httpRequest);

        assertThat(response.isError()).isTrue();
        assertThat(response.code()).isEqualTo("403");
        verify(orderRepository, never()).save(any(Order.class));
        verifyNoInteractions(paymentClient, ticketClient);
    }

    @Test
    void cancellationDoesNotMarkOrderCancelledWhenRefundFails() {
        when(httpRequest.getHeader("Authorization")).thenReturn("Bearer valid-token");
        TokenVerificationResponse verified = new TokenVerificationResponse();
        verified.setCode("TOKEN_VALID");
        verified.setData(Map.of("username", "buyer"));
        when(userClient.verifyToken("valid-token")).thenReturn(Mono.just(verified));
        Order order = order(103L, "buyer", 204L, 304L, OrderStatus.PROCESSING);
        when(orderRepository.findById(103L)).thenReturn(java.util.Optional.of(order));
        when(paymentClient.refund(304L)).thenReturn(Mono.just(
                new ResponseErrorTemplate("refund failed", "PAYMENT_FAILED", Map.of(), true)));

        ResponseErrorTemplate response = service.cancelOrder(103L, httpRequest);

        assertThat(response.isError()).isTrue();
        assertThat(response.code()).isEqualTo("409");
        assertThat(order.getOrderStatus()).isEqualTo(OrderStatus.PROCESSING);
        verifyNoInteractions(ticketClient);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void paymentResponseObjectProvidesPaymentIdForSaleCompensation() {
        when(httpRequest.getHeader("Authorization")).thenReturn("Bearer valid-token");
        TokenVerificationResponse verified = new TokenVerificationResponse();
        verified.setCode("TOKEN_VALID");
        verified.setData(Map.of("username", "buyer"));
        when(userClient.verifyToken("valid-token")).thenReturn(Mono.just(verified));
        OrderRequest request = new OrderRequest();
        request.setEventId(20L);
        request.setTicketId(21L);
        request.setQuantity(1);
        request.setAmount(BigDecimal.TEN);
        when(ticketClient.reserve(21L, 1, "buyer")).thenReturn(Mono.just(
                new ResponseErrorTemplate("reserved", "SUCCESS", Map.of("eventId", 20L, "price", "10.00"), false)));
        Order order = new Order();
        order.setId(99L);
        when(orderMapper.toEntity(request)).thenReturn(order);
        when(paymentClient.processingPayment(any())).thenReturn(Mono.just(
                new ResponseErrorTemplate("paid", "SUCCESS", Map.of("paymentId", 555L), false)));
        when(ticketClient.confirm(21L, "buyer")).thenReturn(Mono.just(
                new ResponseErrorTemplate("sale failed", "CONFLICT", Map.of(), true)));
        when(paymentClient.refund(555L)).thenReturn(Mono.just(success("refunded")));
        when(ticketClient.release(21L, "buyer")).thenReturn(Mono.just(success("released")));

        ResponseErrorTemplate response = service.createOrder(request, httpRequest);

        assertThat(response.isError()).isTrue();
        assertThat(order.getPaymentId()).isEqualTo(555L);
        verify(paymentClient).refund(555L);
    }

    private Order order(Long id, String username, Long ticketId, Long paymentId, OrderStatus status) {
        Order order = new Order();
        order.setId(id);
        order.setUsername(username);
        order.setTicketId(ticketId);
        order.setPaymentId(paymentId);
        order.setOrderStatus(status);
        return order;
    }

    private ResponseErrorTemplate success(String message) {
        return new ResponseErrorTemplate(message, "SUCCESS", Map.of(), false);
    }
}
