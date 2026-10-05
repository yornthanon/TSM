package com.ticket.eventservice.service;

import com.ticket.common.tenant.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EventImageStorageServiceTest {
    private final EventImageStorageService service = new EventImageStorageService("");

    @AfterEach
    void clearTenantContext() {
        TenantContextHolder.clear();
    }

    @Test
    void rejectsMissingFile() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(null));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void rejectsPhotoLargerThanFiveMebibytes() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.png", "image/png", new byte[5 * 1024 * 1024 + 1]);
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, exception.getStatusCode());
    }

    @Test
    void rejectsInvalidBinaryEvenWhenMimeClaimsPng() {
        TenantContextHolder.set(42L, false);
        MockMultipartFile file = new MockMultipartFile("file", "fake.png", "image/png", new byte[]{1, 2, 3, 4});
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));
        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, exception.getStatusCode());
    }
}
