package com.periferia.posts.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Post response payload")
public class PostResponse {

    @Schema(description = "Post ID")
    private Long id;

    @Schema(description = "Post message content")
    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "When the post was published")
    private LocalDateTime publishedAt;

    @Schema(description = "Post author information")
    private AuthorDto author;

    @Schema(description = "Number of likes on this post")
    private long likesCount;
}
