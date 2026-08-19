package com.ticket.common.criteria;

public enum EntityFieldShare {
    ID("id"),
    ACTIVATE("activate"),
    CREATE_BY("createdBy"),
    CREATE_ON("createdAt"),
    UPDATE_BY("updatedBy"),
    UPDATE_ON("updatedAt"),
    NAME("name"),
    DESCRIPTION("description"),
    STATUS("status"),
    USERNAME("username"),
    EMAIL("email"),
    FIRST_NAME("firstName"),
    LAST_NAME("lastName"),
    PHONE_NUMBER("phoneNumber");

    private final String fieldName;

    EntityFieldShare(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getFieldName() {
        return fieldName;
    }

    public String getKey() {
        return fieldName;
    }
}
