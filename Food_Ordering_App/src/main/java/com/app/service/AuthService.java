package com.app.service;

import com.app.dto.request.LoginRequest;
import com.app.dto.request.RegisterRequest;
import com.app.dto.response.AuthResponse;
import com.app.entity.Role;
import com.app.entity.User;
import com.app.exception.CustomException;
import com.app.repository.RoleRepository;
import com.app.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateRegisterRequest(request);

        if (userRepository.existsByEmail(request.email())) {
            throw new CustomException(HttpStatus.CONFLICT, "Email is already registered");
        }

        String roleName = request.role() == null || request.role().isBlank() ? "USER" : request.role().toUpperCase();
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Invalid role"));

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setAddress(request.address());
        user.setRole(role);

        User savedUser = userRepository.save(user);
        emailService.sendRegistrationSuccessEmail(savedUser.getEmail(), savedUser.getName());
        log.info("User registered successfully: {}", savedUser.getEmail());

        return new AuthResponse("Registration successful", savedUser.getEmail(), role.getName(), "HTTP Basic");
    }

    public AuthResponse login(LoginRequest request) {
        if (request == null || isBlank(request.email()) || isBlank(request.password())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));

        log.info("User logged in successfully: {}", user.getEmail());
        return new AuthResponse("Login successful", user.getEmail(), user.getRole().getName(), "HTTP Basic");
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request == null || isBlank(request.name()) || isBlank(request.email()) || isBlank(request.password())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Name, email and password are required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
