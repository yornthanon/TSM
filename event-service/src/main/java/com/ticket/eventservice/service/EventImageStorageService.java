package com.ticket.eventservice.service;

import com.cloudinary.api.exceptions.ApiException;
import com.ticket.common.tenant.TenantContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class EventImageStorageService {
    private static final Logger log = LoggerFactory.getLogger(EventImageStorageService.class);
    private static final long MAX_BYTES = 5L * 1024L * 1024L;
    private static final Pattern CLOUDINARY_CREDENTIAL_URL =
            Pattern.compile("(?i)cloudinary://[^\\s\\\"'<>]+");
    private static final Pattern AUTHORIZATION_VALUE = Pattern.compile(
            "(?i)(authorization[\\\"']?\\s*[:=][\\\"']?\\s*)(?:bearer\\s+)?[^\\s,;\\\"']+");
    private static final Pattern SENSITIVE_ASSIGNMENT = Pattern.compile(
            "(?i)(api[_-]?key|api[_-]?secret|cloudinary[_-]?url|access[_-]?token|token)" +
                    "([\\s\\\"']*[:=][\\s\\\"']*)([^\\s,;\\\"'<>}]+)");
    private static final Pattern BEARER_TOKEN =
            Pattern.compile("(?i)(bearer\\s+)[A-Za-z0-9._~+/-]+=*");

    private final ImageUploadClient uploadClient;

    @Autowired
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

        try {
            if (!uploadClient.isConfigured()) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Photo storage is not configured. Set CLOUDINARY_URL on the backend service.");
            }

            Map<?, ?> result = uploadClient.upload(content, "ticketdesk/workspace-" + tenantId + "/events");
            Object secureUrl = result == null ? null : result.get("secure_url");
            if (!(secureUrl instanceof String url) || !url.startsWith("https://")) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Cloudinary did not return a secure image URL [CLOUDINARY_INVALID_RESPONSE].");
            }
            return url;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            String referenceId = UUID.randomUUID().toString();
            log.error(
                    "Event photo upload failed: referenceId={} tenantId={} mimeType={} sizeBytes={} " +
                            "exceptionType={} message={}\n{}",
                    referenceId,
                    tenantId,
                    declared,
                    content.length,
                    exception.getClass().getName(),
                    safeMessage(exception),
                    redactedStackTrace(exception));

            ApiException cloudinaryError = findCause(exception, ApiException.class);
            if (cloudinaryError != null) {
                String providerMessage = safeMessage(cloudinaryError);
                String detail = providerMessage.isBlank()
                        ? "Check the Cloudinary credentials, cloud name, account status, and upload permissions."
                        : providerMessage;
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Cloudinary rejected the image upload: " + detail +
                                " [CLOUDINARY_API_REJECTED; reference " + referenceId + "].");
            }

            if (findCause(exception, IOException.class) != null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "The backend could not communicate with Cloudinary. Check network access and retry " +
                                "[CLOUDINARY_NETWORK_ERROR; reference " + referenceId + "].");
            }

            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "The image upload failed unexpectedly [IMAGE_UPLOAD_INTERNAL_ERROR; reference " +
                            referenceId + "]. Check the backend logs for this reference.");
        }
    }

    private static String safeMessage(Throwable exception) {
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            return "";
        }
        return redactSensitiveText(message).replaceAll("[\\r\\n\\t]+", " ").trim();
    }

    private static String redactedStackTrace(Throwable exception) {
        StringWriter buffer = new StringWriter();
        exception.printStackTrace(new PrintWriter(buffer));
        return redactSensitiveText(buffer.toString());
    }

    private static String redactSensitiveText(String value) {
        String redacted = CLOUDINARY_CREDENTIAL_URL.matcher(value)
                .replaceAll("cloudinary://[REDACTED]");
        redacted = AUTHORIZATION_VALUE.matcher(redacted)
                .replaceAll("$1[REDACTED]");
        redacted = SENSITIVE_ASSIGNMENT.matcher(redacted)
                .replaceAll("$1$2[REDACTED]");
        return BEARER_TOKEN.matcher(redacted).replaceAll("$1[REDACTED]");
    }

    private static <T extends Throwable> T findCause(Throwable exception, Class<T> type) {
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (type.isInstance(cause)) {
                return type.cast(cause);
            }
        }
        return null;
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
