package com.ticket.userservice.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;


@Configuration
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomCorsFilter implements Filter {


    private final static String ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
    private final static String ACCESS_CONTROL_ALLOW_METHOD = "Access-Control-Allow-Methods";
    private final static String ACCESS_CONTROL_ALLOW_HEADER = "Access-Control-Allow-Headers";
    private final static String ACCESS_CONTROL_ALLOW_CREDENTIALS = "Access-Control-Allow-Credentials";
    private final static String ACCESS_CONTROL_MAX_AGE = "Access-Control-Max-Age";
    private final static String VARY = "Vary";

    private final Set<String> allowedOrigins;

    public CustomCorsFilter(
            @Value("${app.cors.allowed-origins:http://localhost:5173}") String configuredOrigins) {
        this.allowedOrigins = Arrays.stream(configuredOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {

        log.info("ServletRequest {}", servletRequest);
        log.info("ServletResponse {}", servletResponse);
        final HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;

        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        String requestOrigin = httpServletRequest.getHeader("Origin");
        boolean originAllowed = requestOrigin != null && allowedOrigins.contains(requestOrigin);

        if (originAllowed) {
            httpServletResponse.setHeader(ACCESS_CONTROL_ALLOW_ORIGIN, requestOrigin);
            httpServletResponse.setHeader(ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
            httpServletResponse.setHeader(ACCESS_CONTROL_ALLOW_METHOD, "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            httpServletResponse.setHeader(ACCESS_CONTROL_ALLOW_HEADER,
                    "Authorization, Content-Type, X-Requested-With, Accept");
            httpServletResponse.setHeader(ACCESS_CONTROL_MAX_AGE, "3600");
            httpServletResponse.setHeader(VARY, "Origin");
        }

        // Render polls this endpoint while the application is starting. Do not
        // send the probe through JWT, database, Redis, or Kafka checks.
        if ("/actuator/health".equals(httpServletRequest.getRequestURI())) {
            httpServletResponse.setStatus(HttpServletResponse.SC_OK);
            httpServletResponse.setContentType("application/json");
            httpServletResponse.getWriter().write("{\"status\":\"UP\"}");
            return;
        }

        if (HttpMethod.OPTIONS.name().equalsIgnoreCase(httpServletRequest.getMethod())) {
            httpServletResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

}
