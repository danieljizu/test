package com.periferia.posts.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Create post request payload")
public class CreatePostRequest {

    @Schema(description = "Post message content (max 500 characters)", maxLength = 500, example = "Hello world!")
    private String message;
}
