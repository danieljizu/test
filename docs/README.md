# RedsocialPeriferia

Red social construida con arquitectura de microservicios usando Angular 18, Java Spring Boot 3 y PostgreSQL 16. Permite a los usuarios autenticarse, publicar mensajes y dar likes en tiempo real a las publicaciones de otros usuarios mediante WebSocket.

---

## Arquitectura

```
                          +-----------------------------+
                          |  Navegador (Angular 18)     |
                          |  http://localhost:4200      |
                          +-------------+---------------+
                                        |
                          +-------------v---------------+
                          |   rsp-frontend              |
                          |   nginx:alpine              |
                          |   Puerto 80 (expuesto 4200) |
                          +---+----------+----------+---+
                              |          |          |
                   /api/auth  |  /api/   |  /ws     |
                              |  posts   |          |
              +---------------v--+  +----v----------v---+
              |  rsp-auth-service|  |  rsp-post-service |
              |  Spring Boot 3   |  |  Spring Boot 3    |
              |  Puerto 8081     |  |  Puerto 8082      |
              |  JWT + BCrypt    |  |  JWT + WebSocket  |
              +-------+----------+  +--------+----------+
                      |                      |
                      +----------+-----------+
                                 |
                    +------------v-----------+
                    |   rsp-postgres          |
                    |   PostgreSQL 16-alpine  |
                    |   Puerto 5432           |
                    |   BD: redsocialperiferia|
                    +------------------------+

Red interna Docker: rsp-network (bridge)
Volumen persistente: postgres_data
```

**Flujo de datos:**
- El frontend Angular se comunica con los microservicios únicamente a través del proxy inverso de nginx. Las rutas `/api/auth`, `/api/posts` y `/ws` son enrutadas internamente hacia los contenedores correspondientes.
- Ambos microservicios validan el JWT de forma independiente usando la misma clave secreta.
- Los likes se registran en la base de datos mediante el stored procedure `sp_add_like` y el resultado se difunde por WebSocket a todos los clientes suscritos al tópico `/topic/likes/{postId}`.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Angular | 18 |
| UI Components | Angular Material + CDK | 18 |
| Gestión de estado | NgRx Signals (`@ngrx/signals`) | 18 |
| WebSocket cliente | STOMP.js + SockJS-client | 7.0 / 1.6 |
| Backend (auth) | Spring Boot | 3.3.5 |
| Backend (posts) | Spring Boot | 3.3.5 |
| Lenguaje backend | Java | 21 |
| Autenticación | Spring Security + JWT (jjwt 0.12.6) | — |
| Hash de contraseñas | BCrypt | — |
| Persistencia | Spring Data JPA + Hibernate | — |
| Mensajería tiempo real | Spring WebSocket (STOMP) | — |
| Base de datos | PostgreSQL | 16-alpine |
| Lógica de BD | Stored Procedures PL/pgSQL | — |
| Documentación API | SpringDoc OpenAPI (Swagger UI) | 2.6.0 |
| Contenedores | Docker + Docker Compose | — |
| Servidor web frontend | nginx | alpine |
| Build frontend | Node.js | 20-alpine |
| Build backend | eclipse-temurin JDK + Maven | 21-alpine |
| Reducción de boilerplate | Lombok | — |
| Framework de tests backend | JUnit 5 + Mockito + AssertJ | — |
| Framework de tests frontend | Jasmine + Karma | — |

---

## Requisitos previos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Docker Desktop | 4.x | Debe tener WSL2 habilitado en Windows |
| Git | 2.x | Para clonar el repositorio |

No se requiere instalar Java, Node.js ni PostgreSQL de forma local para ejecutar el proyecto con Docker Compose.

---

## Instalación y ejecución rápida

```bash
git clone <url-del-repositorio>
cd pruebaTecnicaPeriferia
docker-compose up --build
```

Una vez que todos los contenedores estén en estado `healthy` o `running` (aproximadamente 2-3 minutos la primera vez), abrir el navegador en:

```
http://localhost:4200
```

Se mostrará la pantalla de login. Ingresar con cualquiera de los usuarios de prueba listados en la siguiente sección.

---

## Usuarios de prueba

Los siguientes usuarios son insertados automáticamente por el script `db/03_seed.sql` al inicializar la base de datos por primera vez.

| Usuario | Contraseña | Nombre completo | Alias |
|---|---|---|---|
| admin | Admin123! | Carlos Administrador | carlos_adm |
| maria.garcia | Pass123! | María García | maria_g |
| juan.perez | Pass123! | Juan Pérez | jp_perez |
| ana.torres | Pass123! | Ana Torres | ana_t |
| luis.ramos | Pass123! | Luis Ramos | luis_r |

---

## URLs de los servicios

| Servicio | URL | Descripción |
|---|---|---|
| Frontend Angular | http://localhost:4200 | Interfaz de usuario de la red social |
| auth-service API | http://localhost:8081 | API REST de autenticación |
| auth-service Swagger | http://localhost:8081/docs | Documentación interactiva de auth-service |
| post-service API | http://localhost:8082 | API REST de publicaciones y likes |
| post-service Swagger | http://localhost:8082/docs | Documentación interactiva de post-service |
| PostgreSQL | localhost:5432 | Base de datos (usuario: `rspadmin`, BD: `redsocialperiferia`) |

---

## Estructura del repositorio

```
pruebaTecnicaPeriferia/
|
+-- docker-compose.yml                  # Orquestación de los 4 contenedores
|
+-- db/                                 # Scripts SQL ejecutados al iniciar PostgreSQL
|   +-- 01_schema.sql                   # Creación de tablas: users, posts, likes e índices
|   +-- 02_procedures.sql               # Stored procedures: sp_create_post, sp_add_like
|                                       # Función: fn_get_posts_with_likes
|   +-- 03_seed.sql                     # Datos iniciales: 5 usuarios + 1 post por usuario
|
+-- redsocialperiferiaback/             # Código fuente del backend
|   +-- auth-service/                   # Microservicio de autenticación (puerto 8081)
|   |   +-- Dockerfile
|   |   +-- pom.xml
|   |   +-- src/main/java/com/periferia/auth/
|   |       +-- controller/             # AuthController: /api/auth/login y /api/auth/profile
|   |       +-- service/                # AuthService: lógica de login y perfil
|   |       +-- security/              # JwtService, JwtAuthenticationFilter, JwtProperties
|   |       +-- config/                # SecurityConfig, OpenApiConfig
|   |       +-- dto/                   # LoginRequest, LoginResponse, ProfileResponse, ErrorResponse
|   |       +-- entity/                # Entidad JPA User
|   |       +-- repository/            # UserRepository (Spring Data JPA)
|   |       +-- exception/             # AuthException, ResourceNotFoundException, GlobalExceptionHandler
|   |
|   +-- post-service/                  # Microservicio de publicaciones (puerto 8082)
|       +-- Dockerfile
|       +-- pom.xml
|       +-- src/main/java/com/periferia/posts/
|           +-- controller/            # PostController: /api/posts
|           +-- service/              # PostService: lógica de posts, likes y WebSocket
|           +-- security/             # JwtService, JwtAuthenticationFilter, JwtAuthenticatedPrincipal
|           +-- config/               # SecurityConfig, WebSocketConfig, OpenApiConfig
|           +-- dto/                  # CreatePostRequest, PostResponse, LikeResponse, AuthorDto, ErrorResponse
|           +-- entity/               # Entidades JPA: User, Post, Like
|           +-- repository/           # PostRepository, LikeRepository, UserRepository
|           +-- exception/            # ResourceNotFoundException, GlobalExceptionHandler
|
+-- redsocialperiferiafront/           # Código fuente del frontend Angular 18
    +-- Dockerfile                     # Build multi-stage: node:20-alpine + nginx:alpine
    +-- nginx.conf                     # Proxy inverso hacia auth-service y post-service
    +-- angular.json
    +-- package.json
    +-- src/app/
        +-- components/
        |   +-- login/                 # Pantalla de inicio de sesión
        |   +-- posts-list/            # Feed de publicaciones con likes en tiempo real
        |   +-- create-post/           # Formulario para crear nueva publicación
        |   +-- profile/               # Perfil del usuario autenticado
        +-- services/
        |   +-- auth.service.ts        # Llamadas HTTP a /api/auth
        |   +-- post.service.ts        # Llamadas HTTP a /api/posts
        |   +-- websocket.service.ts   # Conexión STOMP/SockJS y suscripción a tópicos
        +-- store/
        |   +-- auth.store.ts          # Estado de autenticación (NgRx Signals)
        |   +-- posts.store.ts         # Estado de publicaciones y likes (NgRx Signals)
        +-- interceptors/
        |   +-- auth.interceptor.ts    # Añade el header Authorization: Bearer <token>
        +-- guards/
        |   +-- auth.guard.ts          # Protege las rutas que requieren autenticación
        +-- models/
            +-- auth.models.ts         # Interfaces: LoginRequest, AuthResponse, UserProfile
            +-- post.models.ts         # Interfaces: Post, LikeUpdate, CreatePostRequest
```

---

## Endpoints de la API

### auth-service (puerto 8081)

| Método | Endpoint | Autenticación | Descripción | Body / Respuesta |
|---|---|---|---|---|
| POST | `/api/auth/login` | No requerida | Autentica al usuario y devuelve un JWT Bearer | Body: `{ "username": "...", "password": "..." }` / Respuesta: `{ "token": "...", "tokenType": "Bearer", "userId": 1, "username": "...", "alias": "..." }` |
| GET | `/api/auth/profile` | JWT requerido | Devuelve los datos del perfil del usuario autenticado | Respuesta: `{ "id": 1, "username": "...", "firstName": "...", "lastName": "...", "email": "...", "birthDate": "...", "alias": "..." }` |

**Códigos de respuesta auth-service:**

| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 401 | Credenciales inválidas o token ausente/expirado |
| 404 | Usuario no encontrado |
| 500 | Error interno del servidor |

---

### post-service (puerto 8082)

Todos los endpoints de post-service requieren el header `Authorization: Bearer <token>`.

| Método | Endpoint | Descripción | Body / Respuesta |
|---|---|---|---|
| GET | `/api/posts` | Lista las publicaciones de todos los usuarios excepto el autenticado, ordenadas del más reciente al más antiguo | Respuesta: array de `PostResponse` |
| POST | `/api/posts` | Crea una nueva publicación para el usuario autenticado. Usa el stored procedure `sp_create_post`. Máximo 500 caracteres. | Body: `{ "message": "..." }` / Respuesta: `PostResponse` con HTTP 201 |
| POST | `/api/posts/{postId}/likes` | Registra un like del usuario autenticado sobre el post indicado. Usa `sp_add_like` (idempotente). Difunde el conteo actualizado por WebSocket. | Respuesta: `{ "postId": 1, "likesCount": 5 }` |

**Estructura de PostResponse:**

```json
{
  "id": 1,
  "message": "Texto de la publicación",
  "publishedAt": "2024-01-15T10:00:00",
  "author": {
    "id": 2,
    "alias": "maria_g",
    "firstName": "María",
    "lastName": "García"
  },
  "likesCount": 3
}
```

**Códigos de respuesta post-service:**

| Código | Significado |
|---|---|
| 200 | Operación exitosa |
| 201 | Publicación creada exitosamente |
| 400 | Mensaje vacío o supera los 500 caracteres |
| 401 | Token ausente, inválido o expirado |
| 404 | Post no encontrado |
| 500 | Error interno del servidor |

---

## WebSocket — Likes en tiempo real

El post-service expone un endpoint WebSocket compatible con SockJS/STOMP en:

```
ws://localhost:8082/ws
```

### Protocolo de conexión

El cliente Angular usa la librería `@stomp/stompjs` junto con `sockjs-client` para establecer la conexión. El servicio `WebSocketService` gestiona el ciclo de vida de la conexión de forma transparente.

### Suscripción a tópicos

Cada publicación visible en el feed tiene su propio tópico de likes:

```
/topic/likes/{postId}
```

Cuando un usuario da like a un post, el servidor:
1. Ejecuta el stored procedure `sp_add_like` en PostgreSQL.
2. Obtiene el conteo actualizado de likes.
3. Publica un mensaje en el tópico `/topic/likes/{postId}` usando `SimpMessagingTemplate`.

### Mensaje recibido por los clientes

```json
{
  "postId": 10,
  "likesCount": 7
}
```

Todos los clientes suscritos a ese tópico reciben el mensaje instantáneamente y actualizan el contador en pantalla sin necesidad de recargar la página ni hacer nuevas peticiones HTTP.

### Reconexión automática

El cliente está configurado con un `reconnectDelay` de 5 segundos. Al reconectarse, se re-suscriben automáticamente todos los tópicos que estaban activos.

---

## Ejecución de tests

### Backend — auth-service

```bash
cd redsocialperiferiaback/auth-service
mvn test
```

Incluye tests unitarios de `AuthService` con JUnit 5, Mockito y AssertJ. Escenarios cubiertos: login exitoso, usuario inexistente, contraseña incorrecta, obtención de perfil y validación del tipo de token Bearer.

### Backend — post-service

```bash
cd redsocialperiferiaback/post-service
mvn test
```

Incluye tests unitarios de `PostService`. Escenarios cubiertos: listado de posts de otros usuarios, creación de post válido, validación de mensaje vacío, validación de mensaje mayor a 500 caracteres, usuario no encontrado, like exitoso, like a post inexistente y verificación del broadcast WebSocket.

### Frontend

```bash
cd redsocialperiferiafront
npm test
```

Ejecuta los tests con Karma y Jasmine. Incluye specs de `AuthStore` y `PostsStore`. Escenarios cubiertos: inicialización de estado, carga de posts exitosa y con error, creación de post, actualización de likes por REST y por WebSocket, e idempotencia del `updateLikeCount` con `postId` desconocido.

---

## Variables de entorno

Las siguientes variables son configuradas en `docker-compose.yml` y pueden modificarse según el entorno de despliegue.

### auth-service y post-service (comparten las mismas variables)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/redsocialperiferia` | URL de conexión a PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `rspadmin` | Usuario de la base de datos |
| `SPRING_DATASOURCE_PASSWORD` | `rsp_secure_pass_2024` | Contraseña de la base de datos |
| `JWT_SECRET` | `redsocialperiferia_jwt_secret_key_2024_super_secure` | Clave secreta para firmar y verificar tokens JWT. Debe ser la misma en ambos servicios. |
| `JWT_EXPIRATION_MS` | `86400000` | Tiempo de expiración del token JWT en milisegundos (por defecto: 24 horas) |

### postgres

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `POSTGRES_DB` | `redsocialperiferia` | Nombre de la base de datos |
| `POSTGRES_USER` | `rspadmin` | Usuario administrador de PostgreSQL |
| `POSTGRES_PASSWORD` | `rsp_secure_pass_2024` | Contraseña del usuario administrador |

### Frontend (clave de localStorage)

| Clave | Valor | Descripción |
|---|---|---|
| `rsp_token` | JWT generado por auth-service | Clave bajo la cual el frontend guarda el token JWT en `localStorage` del navegador |
