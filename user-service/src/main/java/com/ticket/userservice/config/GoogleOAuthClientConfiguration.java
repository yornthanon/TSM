package com.ticket.userservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.util.StringUtils;

@Configuration
public class GoogleOAuthClientConfiguration {

    @Bean
    @Conditional(GoogleOAuthConfigured.class)
    public ClientRegistrationRepository googleClientRegistrationRepository(
            @Value("${google.oauth.client-id:}") String clientId,
            @Value("${google.oauth.client-secret:}") String clientSecret) {
        ClientRegistration google = CommonOAuth2Provider.GOOGLE.getBuilder("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .scope("openid", "email", "profile")
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .build();
        return new InMemoryClientRegistrationRepository(google);
    }

    public static class GoogleOAuthConfigured implements Condition {
        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            String clientId = context.getEnvironment().getProperty("google.oauth.client-id");
            String clientSecret = context.getEnvironment().getProperty("google.oauth.client-secret");
            return StringUtils.hasText(clientId) && StringUtils.hasText(clientSecret);
        }
    }
}
