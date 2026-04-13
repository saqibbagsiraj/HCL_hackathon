package com.app.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${app.mail.from:no-reply@foodapp.local}") String fromAddress
    ) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.fromAddress = fromAddress;
    }

    public void sendRegistrationSuccessEmail(String email, String name) {
        sendEmail(
                email,
                "Welcome to Food Ordering App",
                "Hi %s,\n\nYour registration was successful. You can now browse restaurants and place orders.\n\nRegards,\nFood Ordering App".formatted(name)
        );
    }

    public void sendOrderConfirmationEmail(String email, Integer orderId) {
        sendEmail(
                email,
                "Order Confirmation #" + orderId,
                "Your order #%d has been placed successfully.\n\nThank you for ordering with us.".formatted(orderId)
        );
    }

    public void sendOrderCancellationEmail(String email, Integer orderId) {
        sendEmail(
                email,
                "Order Cancelled #" + orderId,
                "Your order #%d has been cancelled successfully.\n\nIf this was unexpected, please contact support.".formatted(orderId)
        );
    }

    private void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("Email disabled. Would send '{}' to {} with body: {}", subject, to, body.replace('\n', ' '));
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false);
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
            log.info("Email sent to {} with subject '{}'", to, subject);
        } catch (MailException | MessagingException exception) {
            log.error("Failed to send email to {} with subject '{}'", to, subject, exception);
        }
    }
}
