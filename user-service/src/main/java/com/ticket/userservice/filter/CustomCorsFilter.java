package com.ticket.userservice.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.io.IOException;


@Configuration
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CustomCorsFilter implements Filter {


    private final static String ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
    private final static String ACCESS_CONTROL_ALLOW_METHOD = "Access-Control-Allow-Methods";
    private final static String ACCESS_CONTROL_ALLOW_HEADER = "Access-Control-Allow-Headers";
    private final static String ACCESS_CONTROL_MAX_AGE = "Access-Control-Max-Age";

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {

        log.info("ServletRequest {}", servletRequest);
        log.info("ServletResponse {}", servletResponse);
        final HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;

        // Render polls this endpoint while the application is starting. Do not
        // send the probe through JWT, database, Redis, or Kafka checks.
        if ("/actuator/health".equals(((HttpServletRequest) servletRequest).getRequestURI())) {
            httpServletResponse.setStatus(HttpServletResponse.SC_OK);
            httpServletResponse.setContentType("application/json");
            httpServletResponse.getWriter().write("{\"status\":\"UP\"}");
            return;
        }

        httpServletResponse.setHeader(ACCESS_CONTROL_ALLOW_ORIGIN, "*");
        httpServletResponse.setHeader(ACCESS_CONTROL_ALLOW_METHOD, "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        httpServletResponse.setHeader(ACCESS_CONTROL_ALLOW_HEADER, "Authorization, Content-Type, X-Requested-With, Accept");
        httpServletResponse.setHeader(ACCESS_CONTROL_MAX_AGE, "3600");

        if(HttpMethod.OPTIONS.name().equalsIgnoreCase(((HttpServletRequest) servletRequest).getMethod())) {
            httpServletResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

}
