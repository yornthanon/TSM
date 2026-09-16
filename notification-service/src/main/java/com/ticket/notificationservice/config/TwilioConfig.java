package com.ticket.notificationservice.config;

import com.twilio.Twilio;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;

@Configuration
@Slf4j
public class TwilioConfig {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        if (StringUtils.hasText(accountSid)
                && StringUtils.hasText(authToken)
                && StringUtils.hasText(fromNumber)) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio SDK initialized — SMS delivery enabled (from: {})", fromNumber);
        } else {
            log.warn("Twilio credentials not provided — SMS delivery is DISABLED. "
                    + "Set twilio.account-sid, twilio.auth-token and twilio.phone-number to enable.");
        }
    }
}
