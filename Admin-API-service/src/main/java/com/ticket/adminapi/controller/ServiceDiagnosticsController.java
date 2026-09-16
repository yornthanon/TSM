package com.ticket.adminapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/diagnostics")
@CrossOrigin(origins = "*")
public class ServiceDiagnosticsController {

    @GetMapping("/services")
    public ResponseEntity<List<Map<String, Object>>> getServicesHealth() {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("name", "API Gateway", "port", 8080, "status", "UP", "database", "Spring Cloud Gateway", "latencyMs", 12));
        list.add(Map.of("name", "User Service", "port", 8081, "status", "UP", "database", "PostgreSQL (user_db)", "latencyMs", 25));
        list.add(Map.of("name", "Event Service", "port", 8082, "status", "UP", "database", "PostgreSQL (event_db)", "latencyMs", 18));
        list.add(Map.of("name", "Ticket Service", "port", 8083, "status", "UP", "database", "PostgreSQL + Redis Lock", "latencyMs", 15));
        list.add(Map.of("name", "Order Service", "port", 8084, "status", "UP", "database", "PostgreSQL (order_db)", "latencyMs", 22));
        list.add(Map.of("name", "Payment Service", "port", 8085, "status", "UP", "database", "PostgreSQL (payment_db)", "latencyMs", 34));
        list.add(Map.of("name", "Notification Service", "port", 8086, "status", "UP", "database", "Kafka Broker :9092", "latencyMs", 14));
        list.add(Map.of("name", "Admin API Service", "port", 8087, "status", "UP", "database", "In-Memory / Actuator", "latencyMs", 5));
        return ResponseEntity.ok(list);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
            "service", "Admin-API-service",
            "port", 8087,
            "status", "UP",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
