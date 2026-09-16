package com.ticket.common.exception;

import lombok.Getter;

@Getter
public class SystemException extends RuntimeException {

    private final String code;

    public SystemException(String message) {
        super(message);
        this.code = "SYSTEM_ERROR";
    }

    public SystemException(String message, String code) {
        super(message);
        this.code = code;
    }
}
