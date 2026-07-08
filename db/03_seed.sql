-- =============================================================================
-- 03_seed.sql
-- Datos de prueba para "redsocialperiferia"
-- Inserta 5 usuarios con contraseñas hasheadas en BCrypt y una publicación
-- por cada usuario para disponer de un entorno funcional desde el inicio.
-- Todos los INSERT usan ON CONFLICT DO NOTHING para ser idempotentes:
-- ejecutar este script múltiples veces no genera registros duplicados.
--
-- Credenciales de acceso:
--   admin        → Admin123!
--   maria.garcia → Pass123!
--   juan.perez   → Pass123!
--   ana.torres   → Pass123!
--   luis.ramos   → Pass123!
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Inserción de usuarios
-- Los hashes BCrypt provistos son válidos para las contraseñas indicadas.
-- -----------------------------------------------------------------------------
INSERT INTO users (username, email, password_hash, first_name, last_name, birth_date, alias) VALUES
(
    'admin',
    'admin@redsocial.com',
    '$2b$10$D/kRnDEz/lUy1NwjpVecOeEmrjQvwTpVF1n36Zc85EN.3L5HMzQ06',
    'Carlos',
    'Administrador',
    '1985-03-10',
    'carlos_adm'
),
(
    'maria.garcia',
    'maria.garcia@redsocial.com',
    '$2b$10$NDChbcdpMjWHqgpMceLuKuNJGnZejj.8IAorNpzxZykfd2cymMYUC',
    'María',
    'García',
    '1992-07-22',
    'maria_g'
),
(
    'juan.perez',
    'juan.perez@redsocial.com',
    '$2b$10$NDChbcdpMjWHqgpMceLuKuNJGnZejj.8IAorNpzxZykfd2cymMYUC',
    'Juan',
    'Pérez',
    '1988-11-05',
    'jp_perez'
),
(
    'ana.torres',
    'ana.torres@redsocial.com',
    '$2b$10$NDChbcdpMjWHqgpMceLuKuNJGnZejj.8IAorNpzxZykfd2cymMYUC',
    'Ana',
    'Torres',
    '1995-02-18',
    'ana_t'
),
(
    'luis.ramos',
    'luis.ramos@redsocial.com',
    '$2b$10$NDChbcdpMjWHqgpMceLuKuNJGnZejj.8IAorNpzxZykfd2cymMYUC',
    'Luis',
    'Ramos',
    '1990-09-30',
    'luis_r'
)
ON CONFLICT (username) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Inserción de publicaciones (1 post por usuario)
-- Se resuelve el user_id mediante JOIN para evitar asumir valores de la secuencia.
-- -----------------------------------------------------------------------------
INSERT INTO posts (user_id, message, published_at)
SELECT u.id, msg.message, msg.published_at
FROM (VALUES
    (
        'admin',
        'Bienvenidos a RedsocialPeriferia, la nueva red social.',
        NOW() - INTERVAL '5 days'
    ),
    (
        'maria.garcia',
        'Hoy fue un gran día para aprender algo nuevo. ¡Nunca paren de crecer!',
        NOW() - INTERVAL '4 days'
    ),
    (
        'juan.perez',
        'El código limpio es poesía para los ojos de un programador.',
        NOW() - INTERVAL '3 days'
    ),
    (
        'ana.torres',
        'Cada desafío es una oportunidad disfrazada. ¡Adelante siempre!',
        NOW() - INTERVAL '2 days'
    ),
    (
        'luis.ramos',
        'Los microservicios son el futuro, ¡pero no olviden monitorearlos!',
        NOW() - INTERVAL '1 day'
    )
) AS msg(username, message, published_at)
JOIN users u ON u.username = msg.username
ON CONFLICT DO NOTHING;
