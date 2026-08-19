package com.ticket.apigateway.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import reactor.core.publisher.Mono;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RouteCreateException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Mono<ApiResponse<Object>> handleRouteCreateException(RouteCreateException ex) {

        return Mono.just(ApiResponse.error(ex.getErrorCode(), ex.getMessage()));



    }

    @ExceptionHandler(RouteNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Mono<ApiResponse<Object>> handleRouteNotFoundException(RouteNotFoundException ex) {

        return Mono.just(ApiResponse.error("404", ex.getMessage()));

    }
}
