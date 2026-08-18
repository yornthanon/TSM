package com.ticket.userservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ticket.common.dto.response.MetaData;
import com.ticket.common.dto.response.PaginationResponse;

import java.util.List;


public record RolePaginationResponse(
        @JsonProperty("items") List<RoleResponse> responses,
        @JsonProperty("page") PaginationResponse paginationResponse,
        @JsonProperty("metadata") MetaData metadata
) {
}