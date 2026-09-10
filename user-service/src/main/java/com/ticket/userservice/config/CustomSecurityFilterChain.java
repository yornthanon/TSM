package com.ticket.userservice.config;

import com.ticket.userservice.config.properties.JwtConfigProperties;
import com.ticket.userservice.filter.CustomAccessDeniedHandler;
import com.ticket.userservice.filter.CustomAuthenticationProvider;
import com.ticket.userservice.filter.JwtAuthenticationFilter;
import com.ticket.userservice.filter.JwtAuthenticationInternalFilter;
import com.ticket.userservice.service.JwtService;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class CustomSecurityFilterChain extends JwtConfigProperties {

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final CustomUserDetailService customUserDetailService;
    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public void userAuthenticationGlobalConfig(AuthenticationManagerBuilder authenticationManagerBuilder) {
        authenticationManagerBuilder.authenticationProvider(customAuthenticationProvider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {

        AuthenticationManagerBuilder managerBuilder = httpSecurity.getSharedObject(AuthenticationManagerBuilder.class);
        managerBuilder.userDetailsService(customUserDetailService).passwordEncoder(passwordEncoder);
        AuthenticationManager authenticationManager = managerBuilder.build();

        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/public/users/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**")
                        .permitAll()
                        .requestMatchers("/api/v1/users/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/v1/roles/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/v1/groups/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/v1/permissions/**")
                        .hasAnyAuthority("USER", "ADMIN")
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        .anyRequest()
                        .authenticated()
                )
                .authenticationManager(authenticationManager)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(
                        (exception) -> exception
                                .authenticationEntryPoint(
                                        (((request, response, authException)
                                                -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED))))
                                .accessDeniedHandler(new CustomAccessDeniedHandler()))
                .addFilterBefore(
                        new JwtAuthenticationFilter(
                                jwtService, objectMapper, getUrl(), authenticationManager, customUserDetailService),
                        UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new JwtAuthenticationInternalFilter(jwtService, objectMapper, this),
                        UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }

}