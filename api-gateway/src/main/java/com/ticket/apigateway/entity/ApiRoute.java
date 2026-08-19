package com.ticket.apigateway.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "api_route")
public class ApiRoute {
    @Id
    private Long id;
    private String uri;
    private String path;
    private String method;
    private String description;
    private String groupCode;
    private Integer rateLimed;
    private Integer rateLimitDuration;
    private String status;
    @Column( "created_at")
    private LocalDateTime createdAt;
    @Column("created_by" )
    private String createdBy;
    @Column("updated_at")
    private LocalDateTime updatedAt;
    @Column("updated_by")
    private String updatedBy;

    public boolean isActive() {
        return status == null || "ACTIVE".equalsIgnoreCase(status);
    }

}

