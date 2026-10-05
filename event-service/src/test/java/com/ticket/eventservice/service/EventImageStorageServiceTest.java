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
        assertEquals("Choose an image to upload.", exception.getReason());
    }

    @Test
    void rejectsPhotoLargerThanFiveMebibytes() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "large.png", "image/png", new byte[5 * 1024 * 1024 + 1]);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));

        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, exception.getStatusCode());
        assertEquals("Image must be 5 MiB or smaller.", exception.getReason());
    }

    @Test
    void rejectsUploadWithoutWorkspace() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/png", validPngBytes());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Select a workspace before uploading an image.", exception.getReason());
    }

    @Test
    void rejectsInvalidBinaryEvenWhenMimeClaimsPng() {
        TenantContextHolder.set(42L, false);
        MockMultipartFile file = new MockMultipartFile("file", "fake.png", "image/png", new byte[]{1, 2, 3, 4});

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));

        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, exception.getStatusCode());
        assertEquals("Upload a valid JPEG, PNG, or WebP image.", exception.getReason());
    }

    @Test
    void rejectsMismatchedDeclaredMimeType() {
        TenantContextHolder.set(42L, false);
        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/jpeg", validPngBytes());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));

        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, exception.getStatusCode());
    }

    @Test
    void acceptsPngContentTypeWithParametersBeforeCheckingStorageConfiguration() {
        TenantContextHolder.set(42L, false);
        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/png; charset=binary", validPngBytes());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
        assertEquals("Photo storage is not configured. Set CLOUDINARY_URL on the backend service.",
                exception.getReason());
    }

    @Test
    void reportsMissingCloudinaryConfigurationAfterValidatingImage() {
        TenantContextHolder.set(42L, false);
        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/png", validPngBytes());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.upload(file));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
        assertEquals("Photo storage is not configured. Set CLOUDINARY_URL on the backend service.",
                exception.getReason());
    }

    private static byte[] validPngBytes() {
        return new byte[]{
                (byte) 0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a
        };
    }
}
