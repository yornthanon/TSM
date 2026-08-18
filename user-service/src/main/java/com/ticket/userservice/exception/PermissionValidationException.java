package com.ticket.userservice.exception;

import java.io.Serial;

public class PermissionValidationException extends RuntimeException {



        @Serial
        private static final long serialVersionUID = 1L;

        private final String field;
        private final String value;

        public PermissionValidationException(String field, String value) {
            super(String.format("Validation failed for field '%s': %s", field, value));
            this.field = field;
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public String getField() {
            return field;
        }
    }


