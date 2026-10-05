package com.ticket.userservice.exception;

import com.ticket.common.exception.ResponseErrorTemplate;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlobalExceptionHandlerTest {
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void preservesResponseStatusExceptionStatusAndReason() {
        String reason = "Cloudinary rejected the image upload: missing upload/create access " +
                "[CLOUDINARY_API_REJECTED; reference test-reference].";
        ResponseStatusException exception = new ResponseStatusException(HttpStatus.BAD_GATEWAY, reason);

        ResponseEntity<ResponseErrorTemplate> response = handler.handleResponseStatusException(exception);

        assertEquals(HttpStatus.BAD_GATEWAY, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(reason, response.getBody().message());
        assertEquals("502", response.getBody().code());
        assertTrue(response.getBody().isError());
    }
}
