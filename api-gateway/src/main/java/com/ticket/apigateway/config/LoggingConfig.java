package com.ticket.apigateway.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.apigateway.logging.GatewayLoggingProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.EnableWebFlux;

@Slf4j
@Configuration
@EnableWebFlux
@EnableConfigurationProperties(GatewayLoggingProperties.class)
public class LoggingConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

} 