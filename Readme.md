# 🏋️ FitTrack AI — AI-Powered Fitness Tracker

A full-stack, production-grade fitness tracking application built with a **microservices architecture**. It leverages **Google Gemini AI** to generate personalized workout recommendations, **Apache Kafka** for async event-driven processing, **Keycloak** for OAuth2/PKCE authentication, and a **React** frontend.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Services](#services)
- [Technology Stack](#technology-stack)
- [System Architecture Diagram](#system-architecture-diagram)
- [Data Flow](#data-flow)
- [API Reference](#api-reference)
- [Database Design](#database-design)
- [Security Architecture](#security-architecture)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Port Reference](#port-reference)
- [Project Structure](#project-structure)

---

## Architecture Overview

FitTrack AI is composed of **7 independent services** that communicate via REST (synchronous) and Kafka (asynchronous). A centralized API Gateway handles all inbound traffic, JWT validation, and automatic user provisioning from Keycloak.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│              React 19 + Vite  (port 5173)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │  OAuth2 PKCE
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Keycloak (port 8181)                         │
│              Realm: FitTrack-AI  |  Client: oauth2-pkce-client  │
└──────────────────────────┬──────────────────────────────────────┘
                           │  JWT Bearer Token
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API Gateway (port 8080)                        │
│   JWT Validation · CORS · KeycloakUserSyncFilter                │
│   /api/users/** · /api/activities/** · /api/recommendations/**  │
└────────┬──────────────────┬──────────────────┬──────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ User Service │  │ Activity Service │  │    AI Service    │
│  (port 8081) │  │   (port 8082)    │  │   (port 8083)    │
│    MySQL     │  │    MongoDB       │  │    MongoDB       │
└──────────────┘  └────────┬─────────┘  └────────▲─────────┘
                           │  Kafka                │
                           │  activity-events      │
                           └───────────────────────┘
                                                   │
                                            ┌──────┴──────┐
                                            │ Gemini AI   │
                                            │  (Google)   │
                                            └─────────────┘

         ┌──────────────────────┐    ┌──────────────────────┐
         │   Config Server      │    │   Eureka Server      │
         │    (port 8888)       │    │    (port 8761)       │
         └──────────────────────┘    └──────────────────────┘
```

---

## Services

### 1. 🧑 User Service
Manages user registration, profiles, and validation. Acts as the source of truth for user identity within the system.

- **Port:** `8081`
- **Database:** MySQL (`fitness_tracker_db`)
- **Responsibilities:**
  - Register new users (idempotent — returns existing user if email already exists)
  - Serve user profiles by internal ID
  - Validate user existence by Keycloak ID (used by Activity Service and Gateway)

### 2. 🏃 Activity Service
Tracks fitness activities logged by users. Validates the user, persists the activity, and publishes an event to Kafka for async AI processing.

- **Port:** `8082`
- **Database:** MongoDB (`aiactivitydb`)
- **Responsibilities:**
  - Log new fitness activities (10 supported types)
  - Retrieve activity history per user
  - Publish `Activity` events to Kafka topic `activity-events`
  - Validate users via synchronous call to User Service

### 3. 🤖 AI Service
Consumes activity events from Kafka, sends structured prompts to **Google Gemini AI**, and stores personalized recommendations.

- **Port:** `8083`
- **Database:** MongoDB (`AiFitnessRecommendationdb`)
- **Responsibilities:**
  - Listen to `activity-events` Kafka topic
  - Generate AI recommendations (analysis, improvements, workout suggestions, safety tips)
  - Serve recommendations by user or activity ID

### 4. 🔀 API Gateway
The single entry point for all client requests. Handles JWT validation, CORS, and automatic user synchronization from Keycloak into the User Service.

- **Port:** `8080`
- **Responsibilities:**
  - Validate JWT tokens via Keycloak's JWK endpoint
  - Auto-register new Keycloak users into User Service on first request
  - Inject `X-User-ID` header into all downstream requests
  - Route requests to appropriate services via Eureka load balancing

### 5. ⚙️ Config Server
Centralized configuration management using Spring Cloud Config (native/filesystem profile).

- **Port:** `8888`
- Serves configuration for: `user-service`, `activity-service`, `ai-service`, `api-gateway`

### 6. 🔍 Eureka Server
Service registry and discovery. All services register here; the Gateway uses `lb://SERVICE-NAME` URIs for load-balanced routing.

- **Port:** `8761`

### 7. 🖥️ Frontend
React SPA with OAuth2 PKCE authentication, activity logging, and AI recommendation display.

- **Port:** `5173`
- **Stack:** React 19, Vite 8, MUI v9, Redux Toolkit, React Router v7

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Spring Boot 4.0.6 |
| **Cloud** | Spring Cloud 2025.1.1 |
| **Language** | Java 25 |
| **Build Tool** | Maven |
| **Service Discovery** | Netflix Eureka |
| **Config Management** | Spring Cloud Config Server |
| **API Gateway** | Spring Cloud Gateway (WebFlux) |
| **Message Broker** | Apache Kafka |
| **Relational DB** | MySQL 8 |
| **Document DB** | MongoDB |
| **Authentication** | Keycloak (OAuth2 / PKCE / JWT) |
| **AI Integration** | Google Gemini API |
| **Inter-service HTTP** | Spring WebClient (reactive, load-balanced) |
| **Frontend** | React 19, Vite 8, MUI v9 |
| **State Management** | Redux Toolkit |
| **HTTP Client (FE)** | Axios |
| **Auth (FE)** | react-oauth2-code-pkce |

---

## System Architecture Diagram

### Request Flow (Happy Path)

```
User logs activity via React UI
        │
        ▼
[1] React sends POST /api/activities
    with Bearer JWT + X-User-ID header
        │
        ▼
[2] API Gateway
    ├── Validates JWT signature via Keycloak JWK endpoint
    ├── KeycloakUserSyncFilter:
    │     ├── Parses JWT claims (sub, email, given_name, family_name)
    │     ├── Calls User Service GET /api/users/{keycloakId}/validate
    │     └── If user not found → POST /api/users/register (auto-provision)
    └── Injects X-User-ID header → routes to Activity Service
        │
        ▼
[3] Activity Service
    ├── Reads userId from X-User-ID header
    ├── Calls User Service /validate (WebClient, Eureka lb)
    ├── Saves Activity to MongoDB
    └── Publishes Activity to Kafka topic: activity-events
        │
        ▼
[4] Kafka (activity-events topic)
        │
        ▼
[5] AI Service (Kafka Consumer: activity-processor-group)
    ├── Receives Activity object
    ├── Builds structured prompt
    ├── Calls Google Gemini API
    ├── Parses JSON response
    └── Saves Recommendation to MongoDB
        │
        ▼
[6] React fetches GET /api/recommendations/activity/{id}
    └── Displays: analysis, improvements, suggestions, safety tips
```

---

## Data Flow

### Kafka Event Flow

```
Activity Service                    AI Service
(Producer)                          (Consumer: activity-processor-group)
     │                                       │
     │  topic: activity-events               │
     │  key: userId                          │
     │  value: Activity (JSON)               │
     └──────────────────────────────────────►│
                                             │
                                    ActivityMessageListener
                                             │
                                    ActivityAiService
                                             │
                                    GeminiService (HTTP POST)
                                             │
                                    Google Gemini API
                                             │
                                    RecommendationRepo.save()
                                             │
                                    MongoDB (AiFitnessRecommendationdb)
```

### Synchronous Inter-Service Calls

```
API Gateway ──WebClient──► User Service  (validate + auto-register)
Activity Service ──WebClient──► User Service  (validate before saving)
```

---

## API Reference

### User Service — `/api/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/register` | Register or retrieve existing user | Gateway internal |
| `GET` | `/{userId}` | Get user profile by internal ID | Gateway internal |
| `GET` | `/{userId}/validate` | Check if user exists (returns Boolean) | Gateway internal |

**Register Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "keycloakId": "uuid-from-keycloak",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

### Activity Service — `/api/activities`

| Method | Endpoint | Description | Headers Required |
|---|---|---|---|
| `POST` | `/` | Log a new fitness activity | `Authorization`, `X-User-ID` |
| `GET` | `/` | Get all activities for the current user | `Authorization`, `X-User-ID` |
| `GET` | `/{activityId}` | Get a specific activity by ID | `Authorization` |

**Activity Request Body:**
```json
{
  "userId": "keycloak-user-id",
  "type": "RUNNING",
  "duration": 45,
  "caloriesBurned": 400,
  "startTime": "2025-05-20T07:30:00",
  "additionalMetrics": {
    "distance": 5.2,
    "avgHeartRate": 145,
    "pace": "8:39/km"
  }
}
```

**Supported Activity Types:**
`RUNNING` · `CYCLING` · `SWIMMING` · `WALKING` · `YOGA` · `WEIGHT_TRAINING` · `HIIT` · `CARDIO` · `STRETCHING` · `OTHER`

---

### AI Service — `/api/recommendations`

| Method | Endpoint | Description | Headers Required |
|---|---|---|---|
| `GET` | `/user/{userId}` | Get all recommendations for a user | `Authorization` |
| `GET` | `/activity/{activityId}` | Get recommendation for a specific activity | `Authorization` |

**Recommendation Response:**
```json
{
  "id": "rec-id",
  "userId": "user-id",
  "activityId": "activity-id",
  "activityType": "RUNNING",
  "recommendations": "Overall: Excellent 45-minute run...\nPace: Your pace of 8:39/km is solid...",
  "improvements": [
    "Cadence: Aim for 170-180 steps per minute to reduce injury risk",
    "Hydration: Drink 500ml water 30 minutes before long runs"
  ],
  "suggestions": [
    "Tempo Run: 20-minute run at comfortably hard pace to build lactate threshold",
    "Long Slow Distance: 60-minute easy run to build aerobic base"
  ],
  "safety": [
    "Always warm up with 5 minutes of brisk walking",
    "Stop immediately if you feel chest pain or dizziness"
  ],
  "createdAt": "2025-05-20T08:15:00"
}
```

---

## Database Design

### MySQL — User Service (`fitness_tracker_db`)

**Table: `users`**

| Column | Type | Constraints |
|---|---|---|
| `id` | VARCHAR (UUID) | PK |
| `keycloak_id` | VARCHAR | Unique, Not Null |
| `email` | VARCHAR | Unique, Not Null |
| `password` | VARCHAR | Not Null |
| `first_name` | VARCHAR | |
| `last_name` | VARCHAR | |
| `role` | ENUM | `USER`, `ADMIN` |
| `created_at` | TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | Auto |

---

### MongoDB — Activity Service (`aiactivitydb`)

**Collection: `activities`**

```json
{
  "_id": "ObjectId",
  "userId": "keycloak-sub-uuid",
  "type": "RUNNING",
  "duration": 45,
  "caloriesBurned": 400,
  "startTime": "ISODate",
  "additionalMetrics": { "distance": 5.2, "avgHeartRate": 145 },
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

### MongoDB — AI Service (`AiFitnessRecommendationdb`)

**Collection: `recommendations`**

```json
{
  "_id": "ObjectId",
  "userId": "keycloak-sub-uuid",
  "activityId": "activity-object-id",
  "activityType": "RUNNING",
  "recommendations": "Overall: ... Pace: ... Heart Rate: ... Calories: ...",
  "improvements": ["area: recommendation", "..."],
  "suggestions": ["workout: description", "..."],
  "safety": ["tip 1", "tip 2"],
  "createdAt": "ISODate"
}
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (React)                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  react-oauth2-code-pkce                             │   │
│  │  OAuth2 Authorization Code + PKCE flow              │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │  1. Redirect to Keycloak login
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Keycloak (port 8181)                                       │
│  Realm: FitTrack-AI                                         │
│  Client: oauth2-pkce-client                                 │
│  Scopes: openid roles profile email offline_access          │
│  ◄── 2. Returns JWT access token + refresh token            │
└──────────────────────────────────────────────────────────────┘
                          │  3. Bearer JWT in every API request
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  API Gateway (port 8080)                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SecurityConfig (WebFlux)                           │   │
│  │  • All exchanges require authentication             │   │
│  │  • OAuth2 Resource Server validates JWT             │   │
│  │  • JWK URI: Keycloak /protocol/openid-connect/certs │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  KeycloakUserSyncFilter (WebFilter)                 │   │
│  │  • Parses JWT: sub, email, given_name, family_name  │   │
│  │  • Validates user in User Service                   │   │
│  │  • Auto-registers new users (first login)           │   │
│  │  • Injects X-User-ID header downstream             │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          │  4. X-User-ID injected, JWT stripped
                          ▼
         Downstream services trust X-User-ID header
         (no JWT parsing needed in business services)
```

**CORS Policy (Gateway):**
- Allowed Origins: `http://localhost:5173`
- Allowed Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allowed Headers: `Authorization`, `Content-Type`, `X-User-ID`
- Credentials: `true`

---

## Configuration

All service configuration is centralized in the **Config Server** (`configserver/src/main/resources/config/`).

### Environment Variables Required

Before starting the Config Server, set these environment variables:

```bash
# Google Gemini AI
GEMINI_URL={GEMINI_URL}
GEMINI_KEY={GEMINI_KEY}
```

### Config Server Properties

**`user-service.properties`**
```properties
server.port=8081
spring.datasource.url=jdbc:mysql://localhost:3306/fitness_tracker_db
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
```

**`activity-service.properties`**
```properties
server.port=8082
spring.mongodb.uri=mongodb://localhost:27017/aiactivitydb
spring.kafka.bootstrap-servers=localhost:9092
kafka.topic.name=activity-events
```

**`ai-service.properties`**
```properties
server.port=8083
spring.mongodb.uri=mongodb://localhost:27017/AiFitnessRecommendationdb
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=activity-processor-group
kafka.topic.name=activity-events
gemini.api.url=${GEMINI_URL}
gemini.api.key=${GEMINI_KEY}
```

**`api-gateway.properties`**
```properties
server.port=8080
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8181/realms/FitTrack-AI/protocol/openid-connect/certs
# Routes for user-service, activity-service, ai-service via Eureka lb://
```

---

## Getting Started

### Prerequisites

Ensure the following are installed and running before starting the services:

| Dependency | Version | Notes |
|---|---|---|
| Java | 25 | Required for all Spring Boot services |
| Maven | 3.9+ | Build tool |
| MySQL | 8.x | Create database `fitness_tracker_db` |
| MongoDB | 6.x+ | Databases created automatically |
| Apache Kafka | 3.x+ | With Zookeeper or KRaft mode |
| Keycloak | 24+ | Configure realm and client (see below) |
| Node.js | 20+ | For the React frontend |

---

### Keycloak Setup

1. Start Keycloak on port `8181`
2. Create a new **Realm** named `FitTrack-AI`
3. Create a new **Client** with:
   - Client ID: `oauth2-pkce-client`
   - Client Authentication: `OFF` (public client)
   - Standard Flow: `ON`
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`
4. Ensure the `email`, `given_name`, `family_name` claims are included in the token (default mappers)

---

### Startup Order

Services must be started in this order due to dependencies:

```
1. Config Server    (port 8888)  — must be first
2. Eureka Server    (port 8761)  — service registry
3. User Service     (port 8081)
4. Activity Service (port 8082)
5. AI Service       (port 8083)
6. API Gateway      (port 8080)  — must be last among backend services
7. Frontend         (port 5173)
```

---

### Running the Backend Services

```bash
# 1. Config Server
cd configserver
./mvnw spring-boot:run

# 2. Eureka Server
cd eureka
./mvnw spring-boot:run

# 3. User Service
cd userservice
./mvnw spring-boot:run

# 4. Activity Service
cd activityservice
./mvnw spring-boot:run

# 5. AI Service
# Set environment variables first:
# set GEMINI_URL=https://...   (Windows CMD)
# set GEMINI_KEY=your_key
cd aiservice
./mvnw spring-boot:run

# 6. API Gateway
cd gateway
./mvnw spring-boot:run
```

### Running the Frontend

```bash
cd Fitness-tracker-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Port Reference

| Service | Port | Description |
|---|---|---|
| React Frontend | `5173` | Vite dev server |
| Keycloak | `8181` | Identity provider |
| API Gateway | `8080` | Single entry point for all API calls |
| User Service | `8081` | User management (MySQL) |
| Activity Service | `8082` | Activity tracking (MongoDB + Kafka producer) |
| AI Service | `8083` | AI recommendations (MongoDB + Kafka consumer) |
| Config Server | `8888` | Centralized configuration |
| Eureka Server | `8761` | Service discovery dashboard |
| MySQL | `3306` | Relational database |
| MongoDB | `27017` | Document database |
| Kafka | `9092` | Message broker |

---

## Project Structure

```
Fitness-Tracker-Microservices/
│
├── configserver/                          # Spring Cloud Config Server
│   └── src/main/resources/config/
│       ├── user-service.properties
│       ├── activity-service.properties
│       ├── ai-service.properties
│       └── api-gateway.properties
│
├── eureka/                                # Netflix Eureka Server
│
├── gateway/                               # Spring Cloud Gateway
│   └── src/main/java/.../gateway/
│       ├── config/
│       │   └── SecurityConfig.java        # JWT + CORS config
│       ├── service/
│       │   ├── KeycloakUserSyncFilter.java # Auto user provisioning
│       │   └── UserService.java
│       └── dto/
│           └── RegisterRequest.java
│
├── userservice/                           # User Service (MySQL)
│   └── src/main/java/.../userservice/
│       ├── controller/UserController.java
│       ├── service/UserService.java
│       ├── model/User.java
│       ├── dto/
│       │   ├── RegisterRequest.java
│       │   └── UserResponse.java
│       └── repo/UserRepo.java
│
├── activityservice/                       # Activity Service (MongoDB + Kafka)
│   └── src/main/java/.../activityservice/
│       ├── controller/ActivityController.java
│       ├── service/
│       │   ├── ActivityService.java       # Save + Kafka publish
│       │   └── UserValidationService.java # WebClient call to User Service
│       ├── model/
│       │   ├── Activity.java
│       │   └── ActivityType.java          # Enum: 10 activity types
│       ├── dto/
│       │   ├── ActivityRequest.java
│       │   └── ActivityResponse.java
│       ├── repo/ActivityRepo.java
│       └── config/
│           ├── MongoConfig.java
│           └── WebClientConfig.java
│
├── aiservice/                             # AI Service (MongoDB + Kafka + Gemini)
│   └── src/main/java/.../aiservice/
│       ├── controller/RecommendationController.java
│       ├── service/
│       │   ├── ActivityMessageListener.java  # Kafka consumer
│       │   ├── ActivityAiService.java        # Prompt builder + response parser
│       │   └── GeminiService.java            # Gemini API WebClient
│       ├── model/
│       │   ├── Activity.java              # Kafka message model
│       │   └── Recommendation.java
│       └── repo/RecommendationRepo.java
│
└── Fitness-tracker-frontend/              # React 19 + Vite Frontend
    └── src/
        ├── authConfig.js                  # Keycloak PKCE config
        ├── services/api.js                # Axios API client
        ├── store/
        │   └── authSlice.js               # Redux auth state
        └── components/
            ├── Navbar.jsx
            ├── ActivityList.jsx
            ├── ActivityForm.jsx
            └── ActivityDetails.jsx
```

---

## Key Design Decisions

**Why Kafka for AI processing?**
Activity logging should be fast and non-blocking. AI recommendation generation can take several seconds (Gemini API call + parsing). Kafka decouples these concerns — the user gets an immediate response after logging an activity, and the recommendation appears asynchronously.

**Why does the Gateway inject `X-User-ID`?**
Downstream services don't need to validate JWTs themselves. The Gateway is the trust boundary — it validates the token, extracts the Keycloak `sub` claim, and passes it as a simple header. This keeps business services lean and avoids duplicating security logic.

**Why auto-register users in the Gateway?**
Keycloak manages authentication, but the User Service manages the application's user data (profiles, roles, etc.). The `KeycloakUserSyncFilter` bridges this gap — on first login, it automatically creates a user record in MySQL using the JWT claims, so downstream services always have a valid user to reference.

**Why separate MongoDB databases for Activity and AI services?**
Each service owns its data. The Activity Service's `aiactivitydb` stores raw activity records. The AI Service's `AiFitnessRecommendationdb` stores processed recommendations. This enforces the microservices principle of database-per-service and allows each to scale independently.
