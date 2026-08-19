package com.ticket.apigateway.exception;

import lombok.Getter;

@Getter
public class RouteCreateException extends RuntimeException {

    private final String errorCode;

    public RouteCreateException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public RouteCreateException(String message) {
        super(message);
        this.errorCode = "500";
    }
}
