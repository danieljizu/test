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
@Schema(description = "Post author information")
public class AuthorDto {

    @Schema(description = "Author user ID")
    private Long id;

    @Schema(description = "Author alias")
    private String alias;

    @Schema(description = "Author first name")
    private String firstName;

    @Schema(description = "Author last name")
    private String lastName;
}
