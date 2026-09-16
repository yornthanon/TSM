package com.ticket.apigateway.config;

import com.ticket.apigateway.repository.ApiRouteRepository;
import com.ticket.apigateway.service.Impl.RouteLocatorDetail;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(ApiRouteRepository apiRouteRepository,
                               RouteLocatorBuilder routeLocatorBuilder) {
        return new RouteLocatorDetail(apiRouteRepository, routeLocatorBuilder);
    }
}