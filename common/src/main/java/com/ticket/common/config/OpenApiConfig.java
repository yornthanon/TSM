package com.ticket.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ticketManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Ticket Management API")
                        .description("Microservices-based Event Ticketing Platform")
                        .version("v1.0"));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch("/api/public/**")
                .build();
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("users")
                .pathsToMatch("/api/v1/users/**")
                .build();
    }

    @Bean
    public GroupedOpenApi roleApi() {
        return GroupedOpenApi.builder()
                .group("roles")
                .pathsToMatch("/api/v1/roles/**")
                .build();
    }

    @Bean
    public GroupedOpenApi groupApi() {
        return GroupedOpenApi.builder()
                .group("groups")
                .pathsToMatch("/api/v1/groups/**")
                .build();
    }

    @Bean
    public GroupedOpenApi permissionApi() {
        return GroupedOpenApi.builder()
                .group("permissions")
                .pathsToMatch("/api/v1/permissions/**")
                .build();
    }

    @Bean
    public GroupedOpenApi eventApi() {
        return GroupedOpenApi.builder()
                .group("events")
                .pathsToMatch("/api/v1/events/**")
                .build();
    }

    @Bean
    public GroupedOpenApi ticketApi() {
        return GroupedOpenApi.builder()
                .group("tickets")
                .pathsToMatch("/api/v1/tickets/**")
                .build();
    }

    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder()
                .group("orders")
                .pathsToMatch("/api/v1/orders/**")
                .build();
    }

    @Bean
    public GroupedOpenApi paymentApi() {
        return GroupedOpenApi.builder()
                .group("payments")
                .pathsToMatch("/api/v1/payments/**")
                .build();
    }

    @Bean
    public GroupedOpenApi notificationApi() {
        return GroupedOpenApi.builder()
                .group("notifications")
                .pathsToMatch("/api/v1/notifications/**")
                .build();
    }
}
