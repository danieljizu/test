package com.periferia.posts.service;

import com.periferia.posts.dto.AuthorDto;
import com.periferia.posts.dto.CreatePostRequest;
import com.periferia.posts.dto.LikeResponse;
import com.periferia.posts.dto.PostResponse;
import com.periferia.posts.entity.Post;
import com.periferia.posts.entity.User;
import com.periferia.posts.exception.ResourceNotFoundException;
import com.periferia.posts.repository.LikeRepository;
import com.periferia.posts.repository.PostRepository;
import com.periferia.posts.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final EntityManager entityManager;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsForUser(Long currentUserId) {
        log.info("Fetching posts for user id: {}", currentUserId);

        List<Post> posts = postRepository.findAllByUserIdNotOrderByPublishedAtDesc(currentUserId);

        return posts.stream()
                .map(post -> {
                    long likesCount = likeRepository.countByPostId(post.getId());
                    return mapToPostResponse(post, likesCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public PostResponse createPost(Long userId, CreatePostRequest request) {
        log.info("Creating post for user id: {}", userId);

        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("Message cannot be blank");
        }
        if (request.getMessage().length() > 500) {
            throw new IllegalArgumentException("Message cannot exceed 500 characters");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_create_post");
        query.registerStoredProcedureParameter("p_user_id", Long.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_message", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("post_id", Long.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("published_at", LocalDateTime.class, ParameterMode.OUT);

        query.setParameter("p_user_id", userId);
        query.setParameter("p_message", request.getMessage());
        query.execute();

        Long postId = (Long) query.getOutputParameterValue("post_id");
        LocalDateTime publishedAt = (LocalDateTime) query.getOutputParameterValue("published_at");

        Post post = Post.builder()
                .id(postId)
                .user(user)
                .message(request.getMessage())
                .publishedAt(publishedAt)
                .createdAt(publishedAt)
                .build();

        log.info("Post created with id: {} for user id: {}", postId, userId);

        return mapToPostResponse(post, 0L);
    }

    @Transactional
    public LikeResponse addLike(Long postId, Long userId) {
        log.info("Adding like to post id: {} by user id: {}", postId, userId);

        if (!postRepository.existsById(postId)) {
            throw new ResourceNotFoundException("Post not found with id: " + postId);
        }

        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("sp_add_like");
        query.registerStoredProcedureParameter("p_post_id", Long.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_user_id", Long.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("like_count", Long.class, ParameterMode.OUT);

        query.setParameter("p_post_id", postId);
        query.setParameter("p_user_id", userId);
        query.execute();

        Long likeCount = (Long) query.getOutputParameterValue("like_count");
        long count = likeCount != null ? likeCount : likeRepository.countByPostId(postId);

        log.info("Like added to post id: {}. Total likes: {}", postId, count);

        LikeResponse likeResponse = LikeResponse.builder()
                .postId(postId)
                .likesCount(count)
                .build();

        messagingTemplate.convertAndSend("/topic/likes/" + postId, likeResponse);
        log.info("WebSocket broadcast sent to /topic/likes/{}", postId);

        return likeResponse;
    }

    private PostResponse mapToPostResponse(Post post, long likesCount) {
        User author = post.getUser();
        AuthorDto authorDto = AuthorDto.builder()
                .id(author.getId())
                .alias(author.getAlias())
                .firstName(author.getFirstName())
                .lastName(author.getLastName())
                .build();

        return PostResponse.builder()
                .id(post.getId())
                .message(post.getMessage())
                .publishedAt(post.getPublishedAt())
                .author(authorDto)
                .likesCount(likesCount)
                .build();
    }
}
