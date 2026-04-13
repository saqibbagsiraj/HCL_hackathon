package com.app.service;

import com.app.dto.request.LoginRequest;
import com.app.dto.request.RegisterRequest;
import com.app.dto.response.AuthResponse;
import com.app.entity.Role;
import com.app.entity.User;
import com.app.exception.CustomException;
import com.app.repository.RoleRepository;
import com.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.app.security.JwtUtils;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateRegisterRequest(request);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(HttpStatus.CONFLICT, "Email is already registered");
        }

        String roleName = request.getRole() == null || request.getRole().isBlank() ? "USER" : request.getRole().toUpperCase();
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "Invalid role"));

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRole(role);

        User savedUser = userRepository.save(user);
        emailService.sendRegistrationSuccessEmail(savedUser.getEmail(), savedUser.getName());
        log.info("User registered successfully: {}", savedUser.getEmail());
        
        String token = jwtUtils.generateToken(savedUser.getEmail());

        return new AuthResponse("Registration successful", savedUser.getEmail(), role.getName(), "JWT", token);
    }

    public AuthResponse login(LoginRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "User not found"));

        log.info("User logged in successfully: {}", user.getEmail());
        
        String token = jwtUtils.generateToken(user.getEmail());
        
        return new AuthResponse("Login successful", user.getEmail(), user.getRole().getName(), "JWT", token);
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request == null || isBlank(request.getName()) || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new CustomException(HttpStatus.BAD_REQUEST, "Name, email and password are required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
