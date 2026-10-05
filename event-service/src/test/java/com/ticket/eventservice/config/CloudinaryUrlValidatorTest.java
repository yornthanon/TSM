package com.ticket.eventservice.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CloudinaryUrlValidatorTest {
    @Test
    void acceptsCloudinaryUrlWithApiKeySecretAndCloudName() {
        assertTrue(CloudinaryUrlValidator.isValid(
                "cloudinary://api-key:api-secret@cloud-name"));
    }

    @Test
    void rejectsMissingSecretOrCloudName() {
        assertFalse(CloudinaryUrlValidator.isValid("cloudinary://api-key@cloud-name"));
        assertFalse(CloudinaryUrlValidator.isValid("cloudinary://api-key:api-secret"));
        assertFalse(CloudinaryUrlValidator.isValid(""));
    }

    @Test
    void rejectsWrongScheme() {
        assertFalse(CloudinaryUrlValidator.isValid(
                "https://api-key:api-secret@cloud-name"));
    }
}
