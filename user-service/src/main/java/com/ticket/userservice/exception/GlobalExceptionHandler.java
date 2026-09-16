package com.ticket.userservice.exception;

import com.ticket.common.exception.ResponseErrorTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameValidationException.class)
    public ResponseEntity<ResponseErrorTemplate> handleUsernameValidationException(UsernameValidationException exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put(exception.getField(), exception.getValue());
        ResponseErrorTemplate response = new ResponseErrorTemplate(
                exception.getMessage(),
                "USERNAME_VALIDATION_ERROR",
                null,
                true
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(RoleValidationException.class)
    public ResponseEntity<ResponseErrorTemplate> handleRoleValidationException(RoleValidationException exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put(exception.getField(), exception.getValue());
        ResponseErrorTemplate response = new ResponseErrorTemplate(
                exception.getMessage(),
                "ROLE_VALIDATION_ERROR",
                null,
                true
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(BasedException.class)
    public ResponseEntity<ResponseErrorTemplate> handleBasedException(BasedException exception) {
        Map<String, String> errors = new HashMap<>();
        if (exception.getField() != null) {
            errors.put(exception.getField(), exception.getValue());
        }
        if (exception.getDetails() != null && !exception.getDetails().isBlank()) {
            errors.put("details", exception.getDetails());
        }
        ResponseErrorTemplate response = new ResponseErrorTemplate(
                exception.getMessage(),
                exception.getCode(),
                null,
                true
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResponseErrorTemplate> handleIllegalArgumentException(IllegalArgumentException exception) {
        ResponseErrorTemplate response = new ResponseErrorTemplate(
                exception.getMessage(),
                "BAD_REQUEST",
                null,
                true
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseErrorTemplate> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        ResponseErrorTemplate response = new ResponseErrorTemplate(
                "Request validation failed",
                "VALIDATION_ERROR",
                null,
                true
        );
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ResponseErrorTemplate> handleDataIntegrityViolationException(DataIntegrityViolationException exception) {
        ResponseErrorTemplate response = new ResponseErrorTemplate(
                "Resource already exists",
                "DATA_CONFLICT",
                null,
                true
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseErrorTemplate> handleGenericException(Exception exception) {
        ResponseErrorTemplate response = new ResponseErrorTemplate(
                "An unexpected error occurred",
                "INTERNAL_SERVER_ERROR",
                null,
                true
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
