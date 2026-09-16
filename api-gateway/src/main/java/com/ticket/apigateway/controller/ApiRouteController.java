package com.ticket.apigateway.controller;

import com.ticket.apigateway.dto.RouteApiRequest;
import com.ticket.apigateway.dto.RouteApiResponse;
import com.ticket.apigateway.exception.ApiResponse;
import com.ticket.apigateway.service.ApiRouteService;
import com.ticket.apigateway.service.GatewayRouteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/routes" , produces = MediaType.APPLICATION_JSON_VALUE)

public class ApiRouteController {
    private final ApiRouteService apiRouteService;
    private final GatewayRouteService gatewayRouteService;

    @PostMapping("/refresh")
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<Void>> refreshRoutes() {
        return Mono.fromRunnable(gatewayRouteService::refreshRoutes)
                .then(Mono.just(ApiResponse.success(null)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<RouteApiResponse>> createRoute(
            @RequestBody RouteApiRequest routeApiRequest
            ){
        return apiRouteService.create(routeApiRequest)
                .map(ApiResponse::success);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Flux<ApiResponse<RouteApiResponse>> getAllRoutes() {
        return apiRouteService.findAll()
                .map(ApiResponse::success);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<RouteApiResponse>> getRouteById(@PathVariable Long id) {
        return apiRouteService.findById(id)
                .map(ApiResponse::success);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<RouteApiResponse>> updateRoute(
            @PathVariable Long id,
            @RequestBody RouteApiRequest routeApiRequest
            ){
        return apiRouteService.update(id, routeApiRequest)
                .map(ApiResponse::success);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        return apiRouteService.deleteById(id)
                .then(Mono.just(ApiResponse.success(null)));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.OK)
    public Mono<ApiResponse<Void>> deleteAllRoutes() {
        return apiRouteService.deleteAll()
                .then(Mono.just(ApiResponse.success(null)));
    }

}
