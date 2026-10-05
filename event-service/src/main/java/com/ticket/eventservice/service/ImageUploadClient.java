package com.ticket.eventservice.service;

import java.util.Map;

public interface ImageUploadClient {
    boolean isConfigured();

    Map<?, ?> upload(byte[] content, String folder) throws Exception;
}
