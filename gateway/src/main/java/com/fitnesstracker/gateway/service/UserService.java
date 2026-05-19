package com.fitnesstracker.gateway.service;

import com.fitnesstracker.gateway.dto.RegisterRequest;
import com.fitnesstracker.gateway.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
@NullMarked
public class UserService {

    private final WebClient userServiceWebClient;

    public Mono<Boolean> validateUser(String userId) {
        try {
            log.info("Calling User Service to validate user with userId: {}", userId);
            return userServiceWebClient.get()
                    .uri("/api/users/{userId}/validate", userId)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .onErrorResume(WebClientResponseException.class, e -> {
                        if (e.getStatusCode() == HttpStatus.NOT_FOUND)
                            return Mono.error(new RuntimeException("User not found with userId: " + userId));
                        else if (e.getStatusCode() == HttpStatus.BAD_REQUEST)
                            return Mono.error(new RuntimeException("Invalid userId: " + userId));
                        return Mono.error(new RuntimeException("Unexpected error occurred while validating user with userId: " + userId + " - " + e.getMessage()));
                    });
        } catch (WebClientResponseException e) {
            e.printStackTrace();
            log.error("User validation failed for userId: {} with status code: {}", userId, e.getStatusCode());
        }
        return Mono.just(false);
    }

    public Mono<UserResponse> registerUser(RegisterRequest registerRequest) {
        log.info("Calling User Service to register user with email: {}", registerRequest.getEmail());
        return userServiceWebClient.post()
                .uri("/api/users/register")
                .bodyValue(registerRequest)
                .retrieve()
                .bodyToMono(UserResponse.class)
                .onErrorResume(WebClientResponseException.class, e -> {
                    if (e.getStatusCode() == HttpStatus.BAD_REQUEST)
                        return Mono.error(new RuntimeException("Bad Request: " + e.getMessage()));
                    return Mono.error(new RuntimeException("Unexpected error occurred while registering user with email: " + registerRequest.getEmail() + " - " + e.getMessage()));
                });
    }
}
