package com.ticket.userservice.dto.response;

import java.math.BigDecimal;

public record AdminWorkspaceOverviewResponse(
        Long workspaceId,
        String workspaceName,
        String status,
        Long ownerUserId,
        String ownerEmail,
        String ownerUsername,
        long userCount,
        long eventCount,
        long ticketCount,
        long orderCount,
        BigDecimal orderAmount,
        long paymentCount,
        BigDecimal completedPaymentAmount,
        long notificationCount) {
}
