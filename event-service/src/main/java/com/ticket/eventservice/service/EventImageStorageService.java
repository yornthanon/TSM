package com.ticket.eventservice.service;

import com.ticket.common.tenant.TenantContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;

@Service
public class EventImageStorageService {
    private static final long MAX_BYTES = 5L * 1024L * 1024L;
    private final ImageUploadClient uploadClient;

    public EventImageStorageService(ImageUploadClient uploadClient) {
        this.uploadClient = uploadClient;
    }

    /** Compatibility constructor used by focused tests and local callers. */
    public EventImageStorageService(String cloudinaryUrl) {
        this(new CloudinaryImageUploadClient(cloudinaryUrl));
    }

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an image to upload.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image must be 5 MiB or smaller.");
        }
        Long tenantId = TenantContextHolder.getTenantId();
        if (tenantId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a workspace before uploading an image.");
        }
        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected image could not be read.");
        }
        String detected = detectFormat(content);
        String declared = normalizeMime(file.getContentType());
        if (detected == null || !detected.equals(declared)) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    "Upload a valid JPEG, PNG, or WebP image.");
        }
        if (!uploadClient.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Photo storage is not configured. Set CLOUDINARY_URL on the backend service.");
        }

        try {
            Map<?, ?> result = uploadClient.upload(content, "ticketdesk/workspace-" + tenantId + "/events");
            Object secureUrl = result.get("secure_url");
            if (!(secureUrl instanceof String url) || !url.startsWith("https://")) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Photo storage returned an invalid image URL.");
            }
            return url;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "The image upload could not be completed.");
        }
    }

    private String normalizeMime(String contentType) {
        if (contentType == null) return "";
        String mediaType = contentType.split(";", 2)[0].trim().toLowerCase();
        return switch (mediaType) {
            case "image/jpeg", "image/jpg" -> "jpeg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "";
        };
    }

    private String detectFormat(byte[] bytes) {
        if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff) {
            return "jpeg";
        }
        if (bytes.length >= 8 && (bytes[0] & 0xff) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G'
                && bytes[4] == 0x0d && bytes[5] == 0x0a && bytes[6] == 0x1a && bytes[7] == 0x0a) {
            return "png";
        }
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "webp";
        }
        return null;
    }
}
