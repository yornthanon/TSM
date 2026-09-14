package com.ticket.notificationservice.controller;

import com.ticket.common.constant.ApiConstant;
import com.ticket.common.exception.ResponseErrorTemplate;
import com.ticket.notificationservice.entity.Notification;
import com.ticket.notificationservice.repository.NotificationRepository;
import com.ticket.notificationservice.service.NotificationService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ResponseErrorTemplate> findAll() {
        List<Notification> notifications = notificationRepository.findAll();
        return ResponseEntity.ok(new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                notifications,
                false));
    }

    @GetMapping("/stats")
    public ResponseEntity<ResponseErrorTemplate> getStats() {
        List<Notification> notifications = notificationRepository.findAll();
        Map<String, Long> byStatus = notifications.stream()
                .filter(n -> n.getStatus() != null)
                .collect(Collectors.groupingBy(n -> n.getStatus().name(), Collectors.counting()));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", notifications.size());
        stats.put("byStatus", byStatus);

        return ResponseEntity.ok(new ResponseErrorTemplate(
                ApiConstant.SUCCESS.getDescription(),
                ApiConstant.SUCCESS.getKey(),
                stats,
                false));
    }

    @PostMapping("/{id}/resend")
    public ResponseEntity<ResponseErrorTemplate> resend(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.resend(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseErrorTemplate> delete(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.delete(id));
    }
}
