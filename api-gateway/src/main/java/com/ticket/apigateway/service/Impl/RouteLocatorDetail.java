package com.ticket.apigateway.service.Impl;

import com.ticket.apigateway.entity.ApiRoute;
import com.ticket.apigateway.repository.ApiRouteRepository;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.BooleanSpec;
import org.springframework.cloud.gateway.route.builder.Buildable;
import org.springframework.cloud.gateway.route.builder.PredicateSpec;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import reactor.core.publisher.Flux;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

public class RouteLocatorDetail implements RouteLocator {

    private final ApiRouteRepository apiRouteRepository;
    private final RouteLocatorBuilder routeLocatorBuilder;
    private final Map<String, String> routeUriHostMap;

    public RouteLocatorDetail(ApiRouteRepository apiRouteRepository,
                              RouteLocatorBuilder routeLocatorBuilder) {
        this.apiRouteRepository = apiRouteRepository;
        this.routeLocatorBuilder = routeLocatorBuilder;
        this.routeUriHostMap = parseRouteUriHostMap(System.getenv("ROUTE_URI_HOST_MAP"));
    }

    @Override
    public Flux<Route> getRoutes() {
        RouteLocatorBuilder.Builder builder = routeLocatorBuilder.routes();

        return apiRouteRepository.findAll()
                .map(apiRoute -> builder.route(apiRoute.getId().toString(),
                        predicateSpec -> setPredicateSpec(predicateSpec, apiRoute)))
                .collectList()
                .flatMapMany(builders -> builder.build().getRoutes());
    }

    @Override
    public Flux<Route> getRoutesByMetadata(Map<String, Object> metadata) {
        return RouteLocator.super.getRoutesByMetadata(metadata);
    }

    private Buildable<Route> setPredicateSpec(PredicateSpec predicateSpec,
                                       ApiRoute apiRoute) {
        BooleanSpec booleanSpec = predicateSpec.path(apiRoute.getPath());
        if(apiRoute.getMethod() != null && !apiRoute.getMethod().isBlank()) {
            booleanSpec.and().method(apiRoute.getMethod());
        }
        return booleanSpec.uri(resolveRouteUri(apiRoute.getUri()));
    }

    private String resolveRouteUri(String routeUri) {
        if (routeUri == null || routeUri.isBlank() || routeUriHostMap.isEmpty()) {
            return routeUri;
        }
        try {
            URI parsed = URI.create(routeUri);
            String mappedHost = routeUriHostMap.get(parsed.getHost() + ":" + parsed.getPort());
            if (mappedHost == null) {
                return routeUri;
            }
            return new URI(parsed.getScheme(), parsed.getUserInfo(), mappedHost,
                    parsed.getPort(), parsed.getPath(), parsed.getQuery(), parsed.getFragment()).toString();
        } catch (Exception ignored) {
            return routeUri;
        }
    }

    private Map<String, String> parseRouteUriHostMap(String mapping) {
        Map<String, String> result = new HashMap<>();
        if (mapping == null || mapping.isBlank()) {
            return result;
        }
        for (String entry : mapping.split(",")) {
            String[] pair = entry.trim().split("=", 2);
            if (pair.length == 2 && !pair[0].isBlank() && !pair[1].isBlank()) {
                result.put(pair[0].trim(), pair[1].trim());
            }
        }
        return result;
    }

}
