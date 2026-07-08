package com.periferia.auth.service;

import com.periferia.auth.dto.LoginRequest;
import com.periferia.auth.dto.LoginResponse;
import com.periferia.auth.dto.ProfileResponse;
import com.periferia.auth.entity.User;
import com.periferia.auth.exception.AuthException;
import com.periferia.auth.exception.ResourceNotFoundException;
import com.periferia.auth.repository.UserRepository;
import com.periferia.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for username: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.error("User not found: {}", request.getUsername());
                    return new AuthException("Credenciales inválidas");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.error("Invalid password for user: {}", request.getUsername());
            throw new AuthException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getAlias());
        log.info("Login successful for user: {}", user.getUsername());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .alias(user.getAlias())
                .build();
    }

    public ProfileResponse getProfile(String username) {
        log.info("Fetching profile for username: {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("Profile not found for user: {}", username);
                    return new ResourceNotFoundException("User not found: " + username);
                });

        return ProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthDate(user.getBirthDate())
                .alias(user.getAlias())
                .email(user.getEmail())
                .build();
    }
}
