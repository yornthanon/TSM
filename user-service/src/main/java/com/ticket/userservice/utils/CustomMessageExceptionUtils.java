package com.ticket.userservice.utils;

import com.ticket.common.dto.EmptyObject;
import com.ticket.common.exception.CustomMessageException;
import org.springframework.http.HttpStatus;

public final class CustomMessageExceptionUtils {

    private CustomMessageExceptionUtils() {
    }

    public static CustomMessageException unauthorized() {
        return new CustomMessageException(
                "Unauthorized access.",
                String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                new EmptyObject(),
                HttpStatus.UNAUTHORIZED);
    }

    public static CustomMessageException forbidden() {
        return new CustomMessageException(
                "Forbidden access.",
                String.valueOf(HttpStatus.FORBIDDEN.value()),
                new EmptyObject(),
                HttpStatus.FORBIDDEN);
    }
}
