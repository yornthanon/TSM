package com.ticket.userservice.config;

import com.ticket.common.internal.InternalTokenProvider;
import com.ticket.userservice.config.properties.JwtConfigProperties;
import com.ticket.userservice.filter.CustomAccessDeniedHandler;
import com.ticket.userservice.filter.CustomAuthenticationProvider;
import com.ticket.userservice.filter.InternalAuthFilter;
import com.ticket.userservice.filter.JwtAuthenticationInternalFilter;
import com.ticket.userservice.filter.TenantScopeFilter;
import com.ticket.userservice.repository.TenantWorkspaceRepository;
import com.ticket.userservice.security.GoogleOAuthLoginHandler;
import com.ticket.userservice.service.JwtService;
import com.ticket.userservice.service.TotpMfaService;
import com.ticket.userservice.service.handle.CustomUserDetailService;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class CustomSecurityFilterChain extends JwtConfigProperties {

    private final JwtService jwtService;
    private final TotpMfaService totpMfaService;
    private final ObjectMapper objectMapper;
    private final CustomUserDetailService customUserDetailService;
    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final PasswordEncoder passwordEncoder;
    private final InternalTokenProvider internalTokenProvider;
    private final ObjectProvider<ClientRegistrationRepository> oauthClientRegistrations;
    private final GoogleOAuthLoginHandler googleOAuthLoginHandler;
    private final TenantWorkspaceRepository tenantWorkspaceRepository;

    @PersistenceContext
    private EntityManager entityManager;

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
                        .requestMatchers(HttpMethod.POST,
                                "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/registration",
                                "/api/public/users/login", "/api/public/users/register",
                                "/api/public/users/registration").denyAll()
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/api/public/**",
                                "/oauth2/**",
                                "/login/oauth2/**",
                                "/health",
                                "/actuator/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**")
                        .permitAll()
                        .requestMatchers("/api/v1/users/me/mfa/**", "/api/v1/users/me")
                        .hasAnyAuthority("USER", "TENANT_ADMIN", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/**")
                        .hasAnyAuthority("ADMIN", "INTERNAL_SERVICE")
                        .requestMatchers("/api/v1/users/**")
                        .hasAnyAuthority("ADMIN", "INTERNAL_SERVICE")
                        .requestMatchers("/api/v1/roles/**", "/api/v1/groups/**", "/api/v1/permissions/**")
                        .hasAuthority("ADMIN")
                        .requestMatchers("/api/v1/workspaces/current")
                        .hasAnyAuthority("USER", "TENANT_ADMIN", "ADMIN")
                        .requestMatchers("/api/v1/admin/**", "/api/admin/**").hasAuthority("ADMIN")
                        .anyRequest()
                        .hasAnyAuthority("USER", "TENANT_ADMIN", "ADMIN", "INTERNAL_SERVICE")
                )
                .authenticationManager(authenticationManager)
                .sessionManagement(sess -> sess.sessionCreationPolicy(
                        oauthClientRegistrations.getIfAvailable() == null
                                ? SessionCreationPolicy.STATELESS
                                : SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(
                        (exception) -> exception
                                .authenticationEntryPoint(
                                        (((request, response, authException)
                                                -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED))))
                                .accessDeniedHandler(new CustomAccessDeniedHandler()))
                .addFilterAfter(new JwtAuthenticationInternalFilter(jwtService, objectMapper, this, customUserDetailService),
                        UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new InternalAuthFilter(internalTokenProvider),
                        JwtAuthenticationInternalFilter.class)
                .addFilterAfter(new TenantScopeFilter(entityManager, tenantWorkspaceRepository, customUserDetailService),
                        InternalAuthFilter.class);

        ClientRegistrationRepository clientRegistrations = oauthClientRegistrations.getIfAvailable();
        if (clientRegistrations != null) {
            DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
                    new DefaultOAuth2AuthorizationRequestResolver(clientRegistrations, "/oauth2/authorization");
            authorizationRequestResolver.setAuthorizationRequestCustomizer(
                    builder -> builder.additionalParameters(parameters ->
                            parameters.put("prompt", "select_account")));
            httpSecurity.oauth2Login(oauth -> oauth
                    .authorizationEndpoint(endpoint ->
                            endpoint.authorizationRequestResolver(authorizationRequestResolver))
                    .successHandler(googleOAuthLoginHandler)
                    .failureHandler(googleOAuthLoginHandler));
        }

        return httpSecurity.build();
    }

}
