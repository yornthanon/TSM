package com.ticket.eventservice.service;

import com.cloudinary.api.exceptions.ApiException;
import com.ticket.common.tenant.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

    @Test
    void uploadsImageToTenantFolderAndReturnsSecureUrl() {
        StubUploadClient client = new StubUploadClient(Map.of(
                "secure_url", "https://res.cloudinary.com/demo/image/upload/event.png"));
        EventImageStorageService configuredService = new EventImageStorageService(client);
        TenantContextHolder.set(42L, false);
        MockMultipartFile file = new MockMultipartFile(
                "file", "cover.png", "image/png", validPngBytes());

        String url = configuredService.upload(file);

        assertEquals("https://res.cloudinary.com/demo/image/upload/event.png", url);
        assertEquals("ticketdesk/workspace-42/events", client.folder);
    }

    @Test
    void returnsSpecificSafeErrorWhenCloudinaryRejectsTheUpload() {
        TenantContextHolder.set(42L, false);
        EventImageStorageService failingService = new EventImageStorageService(
                new FailingUploadClient(new ApiException(
                        "api_secret: private-secret-fragment; Authorization: Bearer private-bearer-token")));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> failingService.upload(validPngFile()));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatusCode());
        assertTrue(exception.getReason().contains("CLOUDINARY_API_REJECTED"));
        assertTrue(exception.getReason().contains("reference"));
        assertTrue(exception.getReason().contains("[REDACTED]"));
        assertFalse(exception.getReason().contains("private-secret-fragment"));
        assertFalse(exception.getReason().contains("private-bearer-token"));
    }

    @Test
    void reportsCloudinaryNetworkFailureSeparately() {
        TenantContextHolder.set(42L, false);
        EventImageStorageService failingService = new EventImageStorageService(
                new FailingUploadClient(new IOException("timeout reaching Cloudinary")));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> failingService.upload(validPngFile()));

        assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatusCode());
        assertTrue(exception.getReason().contains("CLOUDINARY_NETWORK_ERROR"));
        assertTrue(exception.getReason().contains("could not communicate with Cloudinary"));
    }

    @Test
    void returnsReferenceForUnexpectedUploadFailureInsteadOfGenericMessage() {
        TenantContextHolder.set(42L, false);
        EventImageStorageService failingService = new EventImageStorageService(
                new FailingUploadClient(new IllegalStateException("internal diagnostic detail")));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> failingService.upload(validPngFile()));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, exception.getStatusCode());
        assertTrue(exception.getReason().contains("IMAGE_UPLOAD_INTERNAL_ERROR"));
        assertTrue(exception.getReason().contains("reference"));
        assertFalse(exception.getReason().contains("internal diagnostic detail"));
    }

    private static MockMultipartFile validPngFile() {
        return new MockMultipartFile("file", "cover.png", "image/png", validPngBytes());
    }

    private static final class StubUploadClient implements ImageUploadClient {
        private final Map<?, ?> response;
        private String folder;

        private StubUploadClient(Map<?, ?> response) {
            this.response = response;
        }

        @Override
        public boolean isConfigured() {
            return true;
        }

        @Override
        public Map<?, ?> upload(byte[] content, String folder) {
            this.folder = folder;
            return response;
        }
    }

    private static final class FailingUploadClient implements ImageUploadClient {
        private final Exception failure;

        private FailingUploadClient(Exception failure) {
            this.failure = failure;
        }

        @Override
        public boolean isConfigured() {
            return true;
        }

        @Override
        public Map<?, ?> upload(byte[] content, String folder) throws Exception {
            throw failure;
        }
    }

    private static byte[] validPngBytes() {
        return new byte[]{
                (byte) 0x89, 'P', 'N', 'G', 0x0d, 0x0a, 0x1a, 0x0a
        };
    }
}
