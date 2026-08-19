package com.ticket.apigateway.repository;

import com.ticket.apigateway.entity.ApiRoute;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Mono;

public interface ApiRouteRepository extends R2dbcRepository<ApiRoute, Long> {
    Mono<ApiRoute> findFirstById(Long id);

    Mono<ApiRoute> findFirstByPathAndMethod(String path, String method);

    Mono<Void> deleteById(Long id);
}
