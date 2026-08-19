package com.adminpro.security;

import com.adminpro.ui.views.login.LoginView;
import com.vaadin.flow.spring.security.VaadinSecurityConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Basic auth security configuration.
 *
 * Every application route requires authentication. Credentials are backed by
 * app_user records via AppUserDetailsService.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Allow H2 console frames in dev (remove in production)
        http.headers(headers ->
            headers.frameOptions(frame -> frame.sameOrigin())
        );

        // H2 console uses standard requests and should skip CSRF tokens.
        http.csrf(csrf ->
            csrf.ignoringRequestMatchers(new AntPathRequestMatcher("/h2-console/**"))
        );

        // H2 console is restricted to ADMIN users.
        http.authorizeHttpRequests(auth ->
            auth.requestMatchers(new AntPathRequestMatcher("/h2-console/**")).hasRole("ADMIN")
        );

        // Configure Vaadin security (internal endpoints, login view, etc.)
        http.with(VaadinSecurityConfigurer.vaadin(), vaadin -> vaadin
            .loginView(LoginView.class)
        );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
