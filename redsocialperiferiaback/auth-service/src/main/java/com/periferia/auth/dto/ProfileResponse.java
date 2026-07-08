package com.periferia.auth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User profile response")
public class ProfileResponse {

    @Schema(description = "User ID")
    private Long id;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "First name")
    private String firstName;

    @Schema(description = "Last name")
    private String lastName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Birth date", example = "1990-01-15")
    private LocalDate birthDate;

    @Schema(description = "User alias")
    private String alias;

    @Schema(description = "Email address")
    private String email;
}
