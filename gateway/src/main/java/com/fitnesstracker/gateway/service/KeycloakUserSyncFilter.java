package com.fitnesstracker.gateway.service;

import com.fitnesstracker.gateway.dto.RegisterRequest;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NullMarked;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.text.ParseException;

@Component
@RequiredArgsConstructor
@Slf4j
@NullMarked
public class KeycloakUserSyncFilter implements WebFilter {

    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        // try to fetch user-id from the header first
        String userId = exchange.getRequest().getHeaders().getFirst("X-User-ID");

        // get token from the header
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");

        // extract user details from the token
        RegisterRequest registerRequest = getUserDetails(token);

        // if userId is not passed directly in header then extract from token
        if (userId == null) {
            userId = registerRequest.getKeycloakId();
        }

        if (userId != null) {
            String finalUserId = userId;
            return userService.validateUser(userId)
                    .flatMap(exists -> {
                        // If user does not exist, create a new user in the User Service using details from the token
                        if (!exists) {
                            log.info("User with userId: {} does not exist in User Service. Syncing user details from Keycloak...", finalUserId);
                            return userService.registerUser(registerRequest)
                                    .then(Mono.empty()); // return empty Mono to indicate completion of user registration before proceeding with the filter chain
                        } else {
                            log.info("User with userId: {} already exists in User Service. No sync needed.", finalUserId);
                            return Mono.empty(); // user already exists, proceed with the filter chain without doing anything
                        }
                    })
                    .then(Mono.defer(() -> {
                        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                .header("X-User-ID", finalUserId)
                                .build();
                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    }));
        }
        return chain.filter(exchange);
    }

    private RegisterRequest getUserDetails(String token) {
        try {
            // extract token without "Bearer " prefix
            String tokenWithoutBearer = token.replace("Bearer", "").trim();

            // decode the token
            SignedJWT signedJWT = SignedJWT.parse(tokenWithoutBearer);
            return getRegisterRequest(signedJWT);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }

    private RegisterRequest getRegisterRequest(SignedJWT signedJWT) throws ParseException {
        // extract claims from the token (claims contain user details)
        JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();

        // create a RegisterRequest object and populate it with user details from claims
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail(claimsSet.getStringClaim("email"));
        registerRequest.setKeycloakId(claimsSet.getStringClaim("sub"));
        registerRequest.setFirstName(claimsSet.getStringClaim("given_name"));
        registerRequest.setLastName(claimsSet.getStringClaim("family_name"));
        registerRequest.setPassword("dummy@1234"); // Set a default password but give option to reset it later
        return registerRequest;
    }
}
