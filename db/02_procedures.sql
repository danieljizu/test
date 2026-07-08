-- =============================================================================
-- 02_procedures.sql
-- Stored Procedures y Funciones PL/pgSQL para "redsocialperiferia"
-- Contiene la lógica de negocio encapsulada en la base de datos:
--   - sp_create_post  : Crea una nueva publicación y retorna su id y timestamp.
--   - sp_add_like     : Agrega un like a un post (ignorando duplicados) y
--                       retorna el conteo actualizado.
--   - fn_get_posts_with_likes : Devuelve publicaciones con su conteo de likes,
--                               excluyendo las del usuario autenticado.
-- Todos los objetos usan CREATE OR REPLACE para ser idempotentes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Procedure: sp_create_post
-- Inserta una nueva publicación en la tabla posts.
-- Parámetros:
--   IN    p_user_id     : ID del usuario autor de la publicación.
--   IN    p_message     : Contenido textual de la publicación.
--   INOUT p_post_id     : Retorna el ID asignado al nuevo post.
--   INOUT p_published_at: Retorna el timestamp de publicación generado por la BD.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_create_post(
    IN    p_user_id      BIGINT,
    IN    p_message      TEXT,
    INOUT p_post_id      BIGINT,
    INOUT p_published_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO posts (user_id, message, published_at)
    VALUES (p_user_id, p_message, NOW())
    RETURNING id, published_at INTO p_post_id, p_published_at;
END;
$$;

-- -----------------------------------------------------------------------------
-- Procedure: sp_add_like
-- Registra un "me gusta" de un usuario sobre una publicación.
-- Si el like ya existe (constraint uq_like), la operación se ignora silenciosamente.
-- Parámetros:
--   IN    p_post_id   : ID de la publicación a la que se da like.
--   IN    p_user_id   : ID del usuario que da el like.
--   INOUT p_like_count: Retorna el número total de likes del post tras la operación.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_add_like(
    IN    p_post_id    BIGINT,
    IN    p_user_id    BIGINT,
    INOUT p_like_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insertar like ignorando duplicados gracias a ON CONFLICT
    INSERT INTO likes (post_id, user_id)
    VALUES (p_post_id, p_user_id)
    ON CONFLICT ON CONSTRAINT uq_like DO NOTHING;

    -- Obtener conteo actualizado de likes para el post
    SELECT COUNT(*) INTO p_like_count
    FROM likes
    WHERE post_id = p_post_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- Función: fn_get_posts_with_likes
-- Retorna todas las publicaciones de otros usuarios (excluyendo al usuario
-- autenticado) junto con el conteo de likes de cada una, ordenadas del
-- más reciente al más antiguo.
-- Parámetros:
--   p_exclude_user_id : ID del usuario cuyas publicaciones serán excluidas
--                       del resultado (generalmente el usuario autenticado).
-- Retorna: post_id, user_id, message, published_at, likes_count
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_posts_with_likes(p_exclude_user_id BIGINT)
RETURNS TABLE (
    post_id      BIGINT,
    user_id      BIGINT,
    message      TEXT,
    published_at TIMESTAMP,
    likes_count  BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id            AS post_id,
        p.user_id       AS user_id,
        p.message       AS message,
        p.published_at  AS published_at,
        COUNT(l.id)::BIGINT AS likes_count
    FROM posts p
    LEFT JOIN likes l ON l.post_id = p.id
    WHERE p.user_id != p_exclude_user_id
    GROUP BY p.id, p.user_id, p.message, p.published_at
    ORDER BY p.published_at DESC;
END;
$$;
