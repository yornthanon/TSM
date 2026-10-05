package com.ticket.common.exception;

import com.ticket.common.dto.EmptyObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestControllerAdvice
public class GlobalException {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseErrorTemplate> handle(Exception e) {
        log.error(e.getMessage(), e);
        return new ResponseEntity<>(GeneralErrorResponse.generalError(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseErrorTemplate> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage() == null ? "Invalid value." : error.getDefaultMessage()));
        String message = errors.isEmpty() ? "Please check the event details." :
                errors.entrySet().stream().map(entry -> entry.getKey() + ": " + entry.getValue()).reduce((left, right) -> left + "; " + right).orElse("Please check the event details.");
        return ResponseEntity.badRequest().body(
                new ResponseErrorTemplate(message, "VALIDATION_ERROR", errors, true));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseErrorTemplate> handleUnreadableRequest(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(
                new ResponseErrorTemplate("The event data is invalid. Check the date, price, capacity, and event type.",
                        "INVALID_REQUEST", new EmptyObject(), true));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ResponseErrorTemplate> handleStatus(ResponseStatusException e) {
        String message = e.getReason() == null ? "Request could not be completed." : e.getReason();
        return ResponseEntity.status(e.getStatusCode()).body(
                new ResponseErrorTemplate(message, String.valueOf(e.getStatusCode().value()), new EmptyObject(), true));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ResponseErrorTemplate> handleUploadLimit(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(
                new ResponseErrorTemplate("Image must be 5 MiB or smaller.", "413", new EmptyObject(), true));
    }

    @ExceptionHandler({MultipartException.class, MissingServletRequestPartException.class})
    public ResponseEntity<ResponseErrorTemplate> handleMultipart(Exception e) {
        log.warn("Multipart request could not be parsed: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ResponseErrorTemplate(
                        "The uploaded file could not be read. Please choose the file again and retry.",
                        "400", new EmptyObject(), true));
    }

    @ExceptionHandler(CustomMessageException.class)
    public ResponseEntity<ResponseErrorTemplate> handle(CustomMessageException e) {
        log.error(e.getMessage(), e);
        return new ResponseEntity<>(
                new ResponseErrorTemplate(e.getMessage(), e.getCode(), e.getObject(), true), e.getHttpStatus());
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseErrorTemplate> handle(BusinessException e) {
        log.error(e.getErrorMessage(), e);
        return new ResponseEntity<>(
                new ResponseErrorTemplate(e.getErrorMessage(), e.getErrorCode(), new EmptyObject(), true), e.getHttpStatus());
    }

    @ExceptionHandler(SystemException.class)
    public ResponseEntity<ResponseErrorTemplate> handle(SystemException e) {
        log.error(e.getMessage(), e);
        return new ResponseEntity<>(
                new ResponseErrorTemplate(e.getMessage(), e.getCode(), new EmptyObject(), true),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
