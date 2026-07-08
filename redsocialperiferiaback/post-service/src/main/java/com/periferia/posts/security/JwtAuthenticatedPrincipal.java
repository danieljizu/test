package com.periferia.posts.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class JwtAuthenticatedPrincipal {

    private final Long userId;
    private final String username;
}
