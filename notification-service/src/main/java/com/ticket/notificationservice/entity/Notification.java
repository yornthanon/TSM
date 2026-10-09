package com.ticket.notificationservice.entity;

import com.ticket.common.entity.TenantScopedEntity;
import com.ticket.notificationservice.Enum.NotificationStatus;
import com.ticket.notificationservice.Enum.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tt_notification")
@Filter(name = "tenantFilter", condition = "tenant_id in (:tenantIds)")
public class Notification extends TenantScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String email;
    private Long orderId;
    private String eventType;
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type")
    private NotificationType notificationType;
    private String recipient;

    private String subject;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_status")
    private NotificationStatus status;

    private String errorMessage;
}
