package com.ticket.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/** Maps the project error code to the transport-level HTTP status. */
public final class ApiResponse {
    private ApiResponse() {}

    public static ResponseEntity<ResponseErrorTemplate> from(ResponseErrorTemplate body) {
        if (body == null || !body.isError()) {
            return ResponseEntity.ok(body);
        }
        HttpStatus status = statusFor(body.code());
        return ResponseEntity.status(status).body(body);
    }

    private static HttpStatus statusFor(String code) {
        try {
            int numeric = Integer.parseInt(code);
            return HttpStatus.resolve(numeric) == null
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.valueOf(numeric);
        } catch (Exception ignored) {
            return HttpStatus.BAD_REQUEST;
        }
    }
}
