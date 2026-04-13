package com.app.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "email.enabled", havingValue = "true")
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${email.enabled:false}") boolean mailEnabled,
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
                "Hi %s,\n\nYour registration was successful.\n\nRegards,\nFood App".formatted(name)
        );
    }

    private void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("Email disabled → {}", subject);
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
        } catch (MailException | MessagingException e) {
            log.error("Email failed", e);
        }
    }
}
