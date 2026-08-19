package com.ticket.apigateway.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TokenVerificationResponse {

    @JsonProperty("data")
    private TokenData data;

    public boolean isValid() {
        return data != null && data.isValid();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TokenData {
        @JsonProperty("valid")
        private boolean valid;

        public boolean isValid() {
            return valid;
        }
    }
}