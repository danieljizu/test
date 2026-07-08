package com.periferia.posts.controller;

import com.periferia.posts.dto.CreatePostRequest;
import com.periferia.posts.dto.ErrorResponse;
import com.periferia.posts.dto.LikeResponse;
import com.periferia.posts.dto.PostResponse;
import com.periferia.posts.security.JwtAuthenticatedPrincipal;
import com.periferia.posts.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Endpoints for managing posts and likes")
@SecurityRequirement(name = "bearerAuth")
public class PostController {

    private final PostService postService;

    @Operation(summary = "Get all posts", description = "Returns posts from other users, excluding the authenticated user's own posts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Posts retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<PostResponse>> getPosts(
            @AuthenticationPrincipal JwtAuthenticatedPrincipal principal) {
        log.info("GET /api/posts - user id: {}", principal.getUserId());
        List<PostResponse> posts = postService.getPostsForUser(principal.getUserId());
        return ResponseEntity.ok(posts);
    }

    @Operation(summary = "Create a post", description = "Creates a new post for the authenticated user using stored procedure sp_create_post")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post created successfully"),
            @ApiResponse(responseCode = "400", description = "Bad request",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal JwtAuthenticatedPrincipal principal,
            @RequestBody CreatePostRequest request) {
        log.info("POST /api/posts - user id: {}", principal.getUserId());
        PostResponse post = postService.createPost(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @Operation(summary = "Like a post", description = "Adds a like to a post and broadcasts update via WebSocket. Uses stored procedure sp_add_like.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Like added or already exists — returns current like count"),
            @ApiResponse(responseCode = "404", description = "Post not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/{postId}/likes")
    public ResponseEntity<LikeResponse> likePost(
            @AuthenticationPrincipal JwtAuthenticatedPrincipal principal,
            @PathVariable Long postId) {
        log.info("POST /api/posts/{}/likes - user id: {}", postId, principal.getUserId());
        LikeResponse response = postService.addLike(postId, principal.getUserId());
        return ResponseEntity.ok(response);
    }
}
