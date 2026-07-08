package com.periferia.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login request payload")
public class LoginRequest {

    @Schema(description = "Username of the user", example = "johndoe")
    private String username;

    @Schema(description = "Password of the user", example = "secret123")
    private String password;
}
