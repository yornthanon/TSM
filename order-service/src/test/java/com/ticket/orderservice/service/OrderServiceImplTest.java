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
}
