package com.periferia.posts.service;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LikeRepository likeRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private PostService postService;

    private User testUser;
    private User otherUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("johndoe")
                .email("john@example.com")
                .passwordHash("$2a$10$hash")
                .firstName("John")
                .lastName("Doe")
                .birthDate(LocalDate.of(1990, 1, 15))
                .alias("@johndoe")
                .createdAt(LocalDateTime.now())
                .build();

        otherUser = User.builder()
                .id(2L)
                .username("janedoe")
                .email("jane@example.com")
                .passwordHash("$2a$10$hash2")
                .firstName("Jane")
                .lastName("Doe")
                .birthDate(LocalDate.of(1992, 3, 20))
                .alias("@janedoe")
                .createdAt(LocalDateTime.now())
                .build();

        testPost = Post.builder()
                .id(10L)
                .user(otherUser)
                .message("Hello from Jane!")
                .publishedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getPostsForUser_ReturnsOnlyOtherUserPosts() {
        // Arrange
        when(postRepository.findAllByUserIdNotOrderByPublishedAtDesc(1L)).thenReturn(List.of(testPost));
        when(likeRepository.countByPostId(10L)).thenReturn(3L);

        // Act
        List<PostResponse> posts = postService.getPostsForUser(1L);

        // Assert
        assertThat(posts).hasSize(1);
        PostResponse post = posts.get(0);
        assertThat(post.getId()).isEqualTo(10L);
        assertThat(post.getMessage()).isEqualTo("Hello from Jane!");
        assertThat(post.getLikesCount()).isEqualTo(3L);
        assertThat(post.getAuthor().getAlias()).isEqualTo("@janedoe");

        verify(postRepository).findAllByUserIdNotOrderByPublishedAtDesc(1L);
        verify(likeRepository).countByPostId(10L);
    }

    @Test
    void getPostsForUser_WithNoPosts_ReturnsEmptyList() {
        // Arrange
        when(postRepository.findAllByUserIdNotOrderByPublishedAtDesc(1L)).thenReturn(List.of());

        // Act
        List<PostResponse> posts = postService.getPostsForUser(1L);

        // Assert
        assertThat(posts).isEmpty();
        verify(postRepository).findAllByUserIdNotOrderByPublishedAtDesc(1L);
        verifyNoInteractions(likeRepository);
    }

    @Test
    void createPost_WithValidData_ReturnsPostResponse() {
        // Arrange
        CreatePostRequest request = new CreatePostRequest("Hello World!");
        LocalDateTime publishedAt = LocalDateTime.now();

        StoredProcedureQuery spQuery = mock(StoredProcedureQuery.class);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(entityManager.createStoredProcedureQuery("sp_create_post")).thenReturn(spQuery);
        when(spQuery.registerStoredProcedureParameter(anyString(), any(), any())).thenReturn(spQuery);
        when(spQuery.setParameter(anyString(), any())).thenReturn(spQuery);
        when(spQuery.execute()).thenReturn(true);
        when(spQuery.getOutputParameterValue("post_id")).thenReturn(99L);
        when(spQuery.getOutputParameterValue("published_at")).thenReturn(publishedAt);

        // Act
        PostResponse response = postService.createPost(1L, request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(99L);
        assertThat(response.getMessage()).isEqualTo("Hello World!");
        assertThat(response.getLikesCount()).isEqualTo(0L);
        assertThat(response.getAuthor().getId()).isEqualTo(1L);

        verify(userRepository).findById(1L);
        verify(entityManager).createStoredProcedureQuery("sp_create_post");
    }

    @Test
    void createPost_WithBlankMessage_ThrowsIllegalArgumentException() {
        // Arrange - validation fires before user lookup, no repo mocks needed
        CreatePostRequest request = new CreatePostRequest("   ");

        // Act & Assert
        assertThatThrownBy(() -> postService.createPost(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("blank");

        verifyNoInteractions(userRepository);
    }

    @Test
    void createPost_WithMessageExceeding500Chars_ThrowsIllegalArgumentException() {
        // Arrange - validation fires before user lookup, no repo mocks needed
        String longMessage = "a".repeat(501);
        CreatePostRequest request = new CreatePostRequest(longMessage);

        // Act & Assert
        assertThatThrownBy(() -> postService.createPost(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("500");

        verifyNoInteractions(userRepository);
    }

    @Test
    void createPost_WithNonExistentUser_ThrowsResourceNotFoundException() {
        // Arrange
        CreatePostRequest request = new CreatePostRequest("Hello World!");
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> postService.createPost(999L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void addLike_WithExistingPost_ReturnsLikeResponse() {
        // Arrange
        StoredProcedureQuery spQuery = mock(StoredProcedureQuery.class);
        when(postRepository.existsById(10L)).thenReturn(true);
        when(entityManager.createStoredProcedureQuery("sp_add_like")).thenReturn(spQuery);
        when(spQuery.registerStoredProcedureParameter(anyString(), any(), any())).thenReturn(spQuery);
        when(spQuery.setParameter(anyString(), any())).thenReturn(spQuery);
        when(spQuery.execute()).thenReturn(true);
        when(spQuery.getOutputParameterValue("like_count")).thenReturn(5L);

        // Act
        LikeResponse response = postService.addLike(10L, 1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getPostId()).isEqualTo(10L);
        assertThat(response.getLikesCount()).isEqualTo(5L);

        verify(postRepository).existsById(10L);
        verify(messagingTemplate).convertAndSend(eq("/topic/likes/10"), any(LikeResponse.class));
    }

    @Test
    void addLike_WithNonExistentPost_ThrowsResourceNotFoundException() {
        // Arrange
        when(postRepository.existsById(999L)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> postService.addLike(999L, 1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");

        verify(postRepository).existsById(999L);
        verifyNoInteractions(entityManager);
        verifyNoInteractions(messagingTemplate);
    }

    @Test
    void addLike_SendsWebSocketBroadcast() {
        // Arrange
        StoredProcedureQuery spQuery = mock(StoredProcedureQuery.class);
        when(postRepository.existsById(10L)).thenReturn(true);
        when(entityManager.createStoredProcedureQuery("sp_add_like")).thenReturn(spQuery);
        when(spQuery.registerStoredProcedureParameter(anyString(), any(), any())).thenReturn(spQuery);
        when(spQuery.setParameter(anyString(), any())).thenReturn(spQuery);
        when(spQuery.execute()).thenReturn(true);
        when(spQuery.getOutputParameterValue("like_count")).thenReturn(7L);

        // Act
        postService.addLike(10L, 1L);

        // Assert
        verify(messagingTemplate).convertAndSend(eq("/topic/likes/10"), argThat(
                (LikeResponse lr) -> lr.getPostId().equals(10L) && lr.getLikesCount() == 7L
        ));
    }
}
