package com.ticket.eventservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ResponseErrorTemplate(
        @JsonProperty("message") String message,
        @JsonProperty("code") String code,
        @JsonProperty("data") Object data,
        @JsonProperty("is_error") boolean isError
) {
}