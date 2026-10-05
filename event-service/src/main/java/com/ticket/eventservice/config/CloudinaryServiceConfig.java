package com.ticket.eventservice.config;

import com.ticket.eventservice.service.CloudinaryImageUploadClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryServiceConfig {
    @Bean
    public CloudinaryImageUploadClient cloudinaryImageUploadClient(
            @Value("${CLOUDINARY_URL:}") String cloudinaryUrl) {
        return new CloudinaryImageUploadClient(cloudinaryUrl);
    }
}
