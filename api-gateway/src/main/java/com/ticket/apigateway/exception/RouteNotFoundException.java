package com.ticket.apigateway.exception;

import lombok.Getter;

@Getter
public class RouteNotFoundException extends RuntimeException {

    public RouteNotFoundException(String message) {
        super(message);
    }
}
