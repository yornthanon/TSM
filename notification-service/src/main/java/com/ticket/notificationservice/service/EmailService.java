package com.ticket.notificationservice.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:no-reply@ticketmanagement.com}")
    private String fromAddress = "no-reply@ticketmanagement.com";

    @Value("${notification.email.retry.attempts:3}")
    private int retryAttempts = 3;

    @Value("${notification.email.retry.delay-ms:500}")
    private long retryDelayMs = 500;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            log.warn("Email recipient is empty, skipping send");
            return false;
        }
        int maxAttempts = Math.max(1, retryAttempts);
        int attempt = 0;
        while (attempt < maxAttempts) {
            attempt++;
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromAddress);
                helper.setTo(to.trim());
                helper.setSubject(subject);
                helper.setText(body, true);
                mailSender.send(message);
                log.info("Email sent successfully to {} (attempt {}/{})", to, attempt, maxAttempts);
                return true;
            } catch (Exception e) {
                log.error("Failed to send email to {} on attempt {}/{}: {}",
                        to, attempt, maxAttempts, e.getMessage());
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(retryDelayMs * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        return false;
    }

    public String generateOrderConfirmationEmailBody(String username, String eventTitle, LocalDateTime eventDate,
                                                      String location, Integer quantity, BigDecimal amount) {

        String formattedDate = eventDate != null ? eventDate.toString() : "-";
        String formattedAmount = amount != null ? String.format("$%,.2f", amount) : "-";

        return """
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f5; padding:24px;">
                  <div style="max-width:520px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden;">
                    <div style="background:#4f46e5; color:#ffffff; padding:20px 24px;">
                      <h1 style="margin:0; font-size:20px;">Ticket Order Confirmed</h1>
                    </div>
                    <div style="padding:24px;">
                      <p style="font-size:15px; color:#27272a;">Dear %s,</p>
                      <p style="font-size:15px; color:#27272a;">Your ticket order has been confirmed! Here are the details:</p>
                      <table style="width:100%%; border-collapse:collapse; margin:16px 0; font-size:14px; color:#3f3f46;">
                        <tr><td style="padding:8px 0; font-weight:bold;">Event</td><td style="padding:8px 0;">%s</td></tr>
                        <tr><td style="padding:8px 0; font-weight:bold;">Date</td><td style="padding:8px 0;">%s</td></tr>
                        <tr><td style="padding:8px 0; font-weight:bold;">Location</td><td style="padding:8px 0;">%s</td></tr>
                        <tr><td style="padding:8px 0; font-weight:bold;">Quantity</td><td style="padding:8px 0;">%d</td></tr>
                        <tr><td style="padding:8px 0; font-weight:bold;">Total Amount</td><td style="padding:8px 0;">%s</td></tr>
                      </table>
                      <p style="font-size:14px; color:#52525b;">Your tickets will be sent to you shortly. Thank you for choosing our service!</p>
                      <p style="font-size:13px; color:#71717a;">Best regards,<br/>Ticket Management Team</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(username, eventTitle, formattedDate, location, quantity, formattedAmount);
    }
}
