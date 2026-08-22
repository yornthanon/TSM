package com.ticket.notificationservice.service;


import com.ticket.notificationservice.dto.NotificationRequest;
import com.ticket.notificationservice.dto.NotificationResponse;
import com.ticket.common.dto.event.OrderConfirmedEvent;

public interface NotificationService {

     void handlerOrderConfirmationEvent(OrderConfirmedEvent confirmedEvent);

     NotificationResponse sendNotification(NotificationRequest notificationRequest);
}