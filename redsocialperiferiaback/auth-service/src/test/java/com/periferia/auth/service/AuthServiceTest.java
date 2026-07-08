package com.periferia.auth.service;

import com.periferia.auth.dto.LoginRequest;
import com.periferia.auth.dto.LoginResponse;
import com.periferia.auth.dto.ProfileResponse;
import com.periferia.auth.entity.User;
import com.periferia.auth.exception.AuthException;
import com.periferia.auth.exception.ResourceNotFoundException;
import com.periferia.auth.repository.UserRepository;
import com.periferia.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("johndoe")
                .email("john@example.com")
                .passwordHash("$2a$10$hashedpassword")
                .firstName("John")
                .lastName("Doe")
                .birthDate(LocalDate.of(1990, 1, 15))
                .alias("@johndoe")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void login_WithValidCredentials_ReturnsLoginResponse() {
        // Arrange
        LoginRequest request = new LoginRequest("johndoe", "password123");
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
        when(jwtService.generateToken(1L, "johndoe", "@johndoe")).thenReturn("mock.jwt.token");

        // Act
        LoginResponse response = authService.login(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUserId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("johndoe");
        assertThat(response.getAlias()).isEqualTo("@johndoe");

        verify(userRepository).findByUsername("johndoe");
        verify(passwordEncoder).matches("password123", testUser.getPasswordHash());
        verify(jwtService).generateToken(1L, "johndoe", "@johndoe");
    }

    @Test
    void login_WithNonExistentUser_ThrowsAuthException() {
        // Arrange
        LoginRequest request = new LoginRequest("nonexistent", "password123");
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthException.class)
                .hasMessage("Credenciales inválidas");

        verify(userRepository).findByUsername("nonexistent");
        verifyNoInteractions(passwordEncoder);
        verifyNoInteractions(jwtService);
    }

    @Test
    void login_WithWrongPassword_ThrowsAuthException() {
        // Arrange
        LoginRequest request = new LoginRequest("johndoe", "wrongpassword");
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongpassword", testUser.getPasswordHash())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthException.class)
                .hasMessage("Credenciales inválidas");

        verify(passwordEncoder).matches("wrongpassword", testUser.getPasswordHash());
        verifyNoInteractions(jwtService);
    }

    @Test
    void getProfile_WithExistingUser_ReturnsProfileResponse() {
        // Arrange
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(testUser));

        // Act
        ProfileResponse profile = authService.getProfile("johndoe");

        // Assert
        assertThat(profile).isNotNull();
        assertThat(profile.getId()).isEqualTo(1L);
        assertThat(profile.getUsername()).isEqualTo("johndoe");
        assertThat(profile.getFirstName()).isEqualTo("John");
        assertThat(profile.getLastName()).isEqualTo("Doe");
        assertThat(profile.getAlias()).isEqualTo("@johndoe");
        assertThat(profile.getEmail()).isEqualTo("john@example.com");
        assertThat(profile.getBirthDate()).isEqualTo(LocalDate.of(1990, 1, 15));

        verify(userRepository).findByUsername("johndoe");
    }

    @Test
    void getProfile_WithNonExistentUser_ThrowsResourceNotFoundException() {
        // Arrange
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.getProfile("ghost"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ghost");

        verify(userRepository).findByUsername("ghost");
    }

    @Test
    void login_VerifiesTokenTypeIsBearer() {
        // Arrange
        LoginRequest request = new LoginRequest("johndoe", "password123");
        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtService.generateToken(anyLong(), anyString(), anyString())).thenReturn("token");

        // Act
        LoginResponse response = authService.login(request);

        // Assert
        assertThat(response.getTokenType()).isEqualTo("Bearer");
    }
}
