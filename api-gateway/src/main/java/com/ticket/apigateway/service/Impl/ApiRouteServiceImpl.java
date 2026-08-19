package com.ticket.apigateway.service.Impl;

import com.ticket.apigateway.constant.ApiGatewayConstant;
import com.ticket.apigateway.dto.RouteApiRequest;
import com.ticket.apigateway.dto.RouteApiResponse;
import com.ticket.apigateway.entity.ApiRoute;
import com.ticket.apigateway.exception.RouteCreateException;
import com.ticket.apigateway.exception.RouteNotFoundException;
import com.ticket.apigateway.repository.ApiRouteRepository;
import com.ticket.apigateway.service.ApiRouteService;
import com.ticket.apigateway.service.GatewayRouteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApiRouteServiceImpl implements ApiRouteService {
    private final ApiRouteRepository apiRouteRepository;
    private final GatewayRouteService gatewayRouteService;

    @Override
    public Mono<RouteApiResponse> create(RouteApiRequest request) {
        ApiRoute apiRoute = mapToApiRoute(request);
        return apiRouteRepository.save(apiRoute)
                .doOnSuccess(route -> gatewayRouteService.refreshRoutes())
                .map(this::mapToResponse);
    }

    @Override
    public Mono<RouteApiResponse> update(Long id, RouteApiRequest request) {
        return apiRouteRepository.findById(id)
                .switchIfEmpty(Mono.error(new RouteNotFoundException("Route ID " + id + " not found")))
                .flatMap(existing -> {
                    ApiRoute apiRoute = mapToApiRoute(request);
                    apiRoute.setId(existing.getId());
                    apiRoute.setCreatedAt(existing.getCreatedAt());
                    apiRoute.setCreatedBy(existing.getCreatedBy());
                    return apiRouteRepository.save(apiRoute);
                })
                .doOnSuccess(route -> gatewayRouteService.refreshRoutes())
                .map(this::mapToResponse);
    }

    @Override
    public Mono<RouteApiResponse> findById(Long id) {
        return apiRouteRepository.findById(id)
                .switchIfEmpty(Mono.error(new RouteNotFoundException("Route ID " + id + " not found")))
                .map(this::mapToResponse);
    }

    @Override
    public Flux<RouteApiResponse> findAll() {
        return apiRouteRepository.findAll().map(this::mapToResponse);
    }

    @Override
    public Mono<Void> deleteById(Long id) {
        return apiRouteRepository.deleteById(id)
                .then(Mono.fromRunnable(gatewayRouteService::refreshRoutes));
    }

    @Override
    public Mono<Void> deleteAll() {
        return apiRouteRepository.deleteAll()
                .then(Mono.fromRunnable(gatewayRouteService::refreshRoutes));
    }

    private ApiRoute mapToApiRoute(RouteApiRequest routeApiRequest) {
        return ApiRoute.builder()
                .uri(routeApiRequest.uri())
                .path(routeApiRequest.path())
                .method(routeApiRequest.method())
                .description(routeApiRequest.description())
                .groupCode(routeApiRequest.groupCode())
                .rateLimited(routeApiRequest.rateLimit())
                .rateLimitDuration(routeApiRequest.rateLimitDuration())
                .status(routeApiRequest.status())
                .createdAt(LocalDateTime.now())
                .createdBy(ApiGatewayConstant.SYSTEM)
                .updatedAt(LocalDateTime.now())
                .updatedBy(ApiGatewayConstant.SYSTEM)
                .build();
    }

    private RouteApiResponse mapToResponse(ApiRoute apiRoute) {
        return new RouteApiResponse(
                apiRoute.getId(),
                apiRoute.getUri(),
                apiRoute.getPath(),
                apiRoute.getMethod(),
                apiRoute.getDescription(),
                apiRoute.getGroupCode(),
                apiRoute.getRateLimited(),
                apiRoute.getRateLimitDuration(),
                apiRoute.getStatus(),
                apiRoute.getCreatedAt() != null ? apiRoute.getCreatedAt().toString() : null,
                apiRoute.getCreatedBy(),
                apiRoute.getUpdatedAt() != null ? apiRoute.getUpdatedAt().toString() : null,
                apiRoute.getUpdatedBy()
        );
    }
}
