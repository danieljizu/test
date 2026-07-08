package com.periferia.posts.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Like response payload")
public class LikeResponse {

    @Schema(description = "Post ID that was liked")
    private Long postId;

    @Schema(description = "Total number of likes on the post")
    private long likesCount;
}
