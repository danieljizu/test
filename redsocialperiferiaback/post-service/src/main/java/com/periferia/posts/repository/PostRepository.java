package com.periferia.posts.repository;

import com.periferia.posts.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p JOIN FETCH p.user ORDER BY p.publishedAt DESC")
    List<Post> findAllByUserIdNotOrderByPublishedAtDesc(@Param("userId") Long userId);
}
