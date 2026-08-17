package com.ticket.userservice.exception;

import java.io.Serial;

public class BasedException extends  RuntimeException{

    @Serial
    private static final long serialVersionUID = 1L;

    private final String code;
    private final String message;
    private final String details;
    private final String field;
    private final String value;


    public BasedException(String code, String message, String details, String field, String value) {
        this.code = code;
        this.message = message;
        this.details = details;
        this.field = field;
        this.value = value;
    }


    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public String getDetails() {
        return details;
    }

    public String getField() {
        return field;
    }

    public String getValue() {
        return value;
    }
}
