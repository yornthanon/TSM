package com.ticket.eventservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ticket.eventservice.config.CloudinaryUrlValidator;

import java.util.Map;

public class CloudinaryImageUploadClient implements ImageUploadClient {
    private final String cloudinaryUrl;

    public CloudinaryImageUploadClient(String cloudinaryUrl) {
        this.cloudinaryUrl = cloudinaryUrl == null ? "" : cloudinaryUrl.trim();
    }

    @Override
    public boolean isConfigured() {
        return CloudinaryUrlValidator.isValid(cloudinaryUrl);
    }

    @Override
    public Map<?, ?> upload(byte[] content, String folder) throws Exception {
        Cloudinary cloudinary = new Cloudinary(cloudinaryUrl);
        return cloudinary.uploader().upload(content, ObjectUtils.asMap(
                "resource_type", "image",
                "folder", folder,
                "allowed_formats", java.util.List.of("jpg", "jpeg", "png", "webp"),
                "overwrite", false,
                "unique_filename", true));
    }
}
