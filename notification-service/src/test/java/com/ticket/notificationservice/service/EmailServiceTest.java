package com.ticket.notificationservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void sendEmail_shouldReturnTrue_whenMailSenderSucceeds() {
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((jakarta.mail.Session) null));

        boolean result = emailService.sendEmail(
                "buyer@example.com",
                "Confirmation",
                "<html>body</html>");

        assertTrue(result);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendEmail_shouldReturnFalse_whenMailSenderThrows_andNoRetryEventuallyFails() {
        MimeMessage mimeMessage = new MimeMessage((jakarta.mail.Session) null);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("smtp down")).when(mailSender).send(any(MimeMessage.class));

        boolean result = emailService.sendEmail("buyer@example.com", "Confirmation", "<html>body</html>");

        assertFalse(result);
        verify(mailSender, times(3)).send(any(MimeMessage.class));
    }

    @Test
    void sendEmail_shouldReturnFalse_whenRecipientIsBlank() {
        assertFalse(emailService.sendEmail("   ", "Subject", "body"));
    }

    @Test
    void generateOrderConfirmationEmailBody_shouldContainBookingDetails() {
        String body = emailService.generateOrderConfirmationEmailBody(
                "john", "Cool Concert", LocalDateTime.of(2026, 1, 1, 20, 0),
                "Phnom Penh", 2, new BigDecimal("40.00"));

        assertTrue(body.contains("john"));
        assertTrue(body.contains("Cool Concert"));
        assertTrue(body.contains("Phnom Penh"));
        assertTrue(body.contains("2"));
        assertTrue(body.contains("$40.00"));
        assertTrue(body.contains("<html>"));
    }
}
