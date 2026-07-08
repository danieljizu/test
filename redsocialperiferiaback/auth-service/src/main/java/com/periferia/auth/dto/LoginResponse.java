package com.periferia.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login response with JWT token")
public class LoginResponse {

    @Schema(description = "JWT access token")
    private String token;

    @Schema(description = "Token type", example = "Bearer")
    private String tokenType;

    @Schema(description = "User ID")
    private Long userId;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "User alias")
    private String alias;
}
