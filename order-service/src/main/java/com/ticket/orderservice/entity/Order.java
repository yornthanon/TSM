package com.ticket.orderservice.entity;

import com.ticket.common.entity.TenantScopedEntity;
import com.ticket.orderservice.Enum.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Filter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tt_order")
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Order extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private Long ticketId;
    private Long eventId;
    private BigDecimal amount;
    private Integer quantity;
    private Long paymentId;
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus;
    private LocalDateTime orderDate;
}
