package com.urbanlens.service;

import com.urbanlens.dto.AuthResponse;
import com.urbanlens.dto.ForgotPasswordRequest;
import com.urbanlens.dto.ForgotPasswordResponse;
import com.urbanlens.dto.LoginRequest;
import com.urbanlens.dto.RegisterRequest;
import com.urbanlens.dto.ResetPasswordRequest;
import com.urbanlens.dto.UserResponse;
import com.urbanlens.entity.User;
import com.urbanlens.repository.UserRepository;
import com.urbanlens.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    @SuppressWarnings("null")
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        return toAuthResponse(user);
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        String genericMessage = "If an account exists for that email, a reset token has been issued.";

        return userRepository.findByEmailIgnoreCase(email)
                .map(user -> {
                    String token = UUID.randomUUID().toString().replace("-", "");
                    user.setResetToken(token);
                    user.setResetTokenExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
                    userRepository.save(user);
                    // Returned for MVP/demo (no email service yet). Do not expose in production.
                    return new ForgotPasswordResponse(genericMessage, token);
                })
                .orElseGet(() -> new ForgotPasswordResponse(genericMessage, null));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.token())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (user.getResetTokenExpiresAt() == null || user.getResetTokenExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    public UserResponse me(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, com.urbanlens.dto.UpdateProfileRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.preferredTravelStyle() != null) {
            user.setPreferredTravelStyle(blankToNull(request.preferredTravelStyle()));
        }
        if (request.preferredTransportMode() != null) {
            user.setPreferredTransportMode(blankToNull(request.preferredTransportMode()));
        }
        if (request.preferredBudgetTier() != null) {
            user.setPreferredBudgetTier(blankToNull(request.preferredBudgetTier()));
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(blankToNull(request.avatarUrl()));
        }

        return toUserResponse(userRepository.save(user));
    }

    private static String blankToNull(String value) {
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return AuthResponse.bearer(token, toUserResponse(user));
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPreferredTravelStyle(),
                user.getPreferredTransportMode(),
                user.getPreferredBudgetTier(),
                user.getAvatarUrl()
        );
    }
}
