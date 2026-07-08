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
@Schema(description = "Error response payload")
public class ErrorResponse {

    @Schema(description = "HTTP status code")
    private int status;

    @Schema(description = "Error type")
    private String error;

    @Schema(description = "Detailed error message")
    private String message;

    @Schema(description = "Timestamp of the error")
    private String timestamp;

    @Schema(description = "Request path that caused the error")
    private String path;
}
