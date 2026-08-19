package com.ticket.eventservice.constant;

import lombok.Getter;

@Getter
public enum ApiConstant {

    SUCCESS("200", "Successfully!"),
    CREATED("201", "Created successfully."),
    DATA_NOT_FOUND("404", "Data not found for %s."),
    EVENT_NOT_FOUND("404", "Event not found for ID %s."),
    BAD_REQUEST("400", "Bad request."),
    INTERNAL_SERVER_ERROR("500", "Internal server error.");

    private final String key;
    private final String description;

    ApiConstant(String key, String description) {
        this.key = key;
        this.description = description;
    }

    public String getFormattedDescription(Object... args) {
        return String.format(description, args);
    }
}