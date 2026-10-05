package com.ticket.eventservice.config;

import java.net.URI;

public final class CloudinaryUrlValidator {
    private CloudinaryUrlValidator() {
    }

    public static boolean isValid(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        try {
            URI uri = URI.create(value.trim());
            if (!"cloudinary".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null
                    || uri.getHost().isBlank() || uri.getUserInfo() == null) {
                return false;
            }
            String[] credentials = uri.getUserInfo().split(":", 2);
            return credentials.length == 2 && !credentials[0].isBlank() && !credentials[1].isBlank();
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
