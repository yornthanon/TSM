package com.ticket.notificationservice.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:}")
    private String fromNumber;

    private volatile boolean initialized = false;

    public boolean isConfigured() {
        return StringUtils.hasText(accountSid)
                && StringUtils.hasText(authToken)
                && StringUtils.hasText(fromNumber);
    }

    private void ensureInitialized() {
        if (!initialized) {
            synchronized (this) {
                if (!initialized && isConfigured()) {
                    Twilio.init(accountSid, authToken);
                    initialized = true;
                    log.info("Twilio SDK initialized for SMS delivery");
                }
            }
        }
    }

    public boolean sendSms(String phoneNumber, String message) {
        if (!StringUtils.hasText(phoneNumber) || !StringUtils.hasText(message)) {
            log.warn("SMS recipient or message is empty, skipping send");
            return false;
        }
        if (!isConfigured()) {
            log.warn("Twilio is not configured (set twilio.account-sid/auth-token/phone-number). "
                    + "SMS to {} will not be delivered.", phoneNumber);
            return false;
        }
        ensureInitialized();
        try {
            Message.creator(
                    new PhoneNumber(phoneNumber.trim()),
                    new PhoneNumber(fromNumber),
                    message
            ).create();
            log.info("SMS sent successfully to {}", phoneNumber);
            return true;
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
            return false;
        }
    }

    public String generateOrderConfirmationSmsBody(String eventTitle, LocalDateTime eventDate,
                                                    String eventLocation, Integer quantity) {

        String formattedDate = eventDate != null ? eventDate.toString() : "-";

        return """
                Your ticket order for '%s' on %s at %s has been confirmed. Quantity: %d. Thank you for choosing our service!
                """.formatted(eventTitle, formattedDate, eventLocation, quantity);
    }
}
