package com.ticket.apigateway.repository;

import com.ticket.apigateway.entity.RequestLog;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface  RequestLogRepository extends ReactiveCrudRepository<RequestLog, Long> {
} 