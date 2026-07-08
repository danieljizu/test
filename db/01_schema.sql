-- =============================================================================
-- 01_schema.sql
-- Esquema de base de datos para la red social "redsocialperiferia"
-- Crea las tablas principales: users, posts y likes, junto con sus
-- constraints e índices de rendimiento.
-- Todos los objetos se crean de forma idempotente (IF NOT EXISTS).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabla de usuarios
-- Almacena la información de registro de cada usuario de la plataforma.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL    PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    birth_date    DATE         NOT NULL,
    alias         VARCHAR(50)  UNIQUE NOT NULL,
    created_at    TIMESTAMP    DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabla de publicaciones
-- Almacena los mensajes/posts creados por los usuarios.
-- La eliminación de un usuario elimina en cascada todas sus publicaciones.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message      TEXT      NOT NULL,
    published_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMP DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Tabla de likes
-- Registra los "me gusta" que los usuarios otorgan a las publicaciones.
-- La constraint uq_like garantiza que un usuario no pueda dar más de un like
-- al mismo post. La eliminación del post o del usuario elimina sus likes en cascada.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS likes (
    id         BIGSERIAL PRIMARY KEY,
    post_id    BIGINT    NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uq_like UNIQUE (post_id, user_id)
);

-- -----------------------------------------------------------------------------
-- Índices de rendimiento
-- Optimizan las consultas más frecuentes de la aplicación.
-- -----------------------------------------------------------------------------

-- Acelera la búsqueda de publicaciones por autor
CREATE INDEX IF NOT EXISTS idx_posts_user_id
    ON posts(user_id);

-- Acelera el ordenamiento cronológico inverso del feed (más reciente primero)
CREATE INDEX IF NOT EXISTS idx_posts_published_at
    ON posts(published_at DESC);

-- Acelera la obtención del conteo de likes por publicación
CREATE INDEX IF NOT EXISTS idx_likes_post_id
    ON likes(post_id);

-- Acelera la búsqueda de los likes dados por un usuario específico
CREATE INDEX IF NOT EXISTS idx_likes_user_id
    ON likes(user_id);
