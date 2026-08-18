package com.ticket.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MetaData {
    private boolean hasNext;

    private int totalUsers;

    private boolean hasPrevious;

    private int currentPage;

    private int pageSize;

}
