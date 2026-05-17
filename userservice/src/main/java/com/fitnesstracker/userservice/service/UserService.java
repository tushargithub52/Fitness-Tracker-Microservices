package com.fitnesstracker.userservice.service;

import com.fitnesstracker.userservice.dto.RegisterRequest;
import com.fitnesstracker.userservice.dto.UserResponse;
import com.fitnesstracker.userservice.model.User;
import com.fitnesstracker.userservice.repo.UserRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    public ResponseEntity<UserResponse> registerUser(@Valid RegisterRequest registerRequest) {
        //check if user with the given email already exists
        if ((userRepo.existsByEmail(registerRequest.getEmail()))) {
            User existingUser = userRepo.findByEmail(registerRequest.getEmail());
            UserResponse userResponse = getUserResponse(existingUser);
            return ResponseEntity.ok(userResponse);
        }

        //create new user
        User newUser = new User();
        newUser.setEmail(registerRequest.getEmail());
        newUser.setPassword(registerRequest.getPassword());
        newUser.setFirstName(registerRequest.getFirstName());
        newUser.setLastName(registerRequest.getLastName());
        
        User savedUser = userRepo.save(newUser);
        UserResponse userResponse = getUserResponse(savedUser);
        return ResponseEntity.ok(userResponse);
    }

    private UserResponse getUserResponse(User user) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setPassword(user.getPassword());
        userResponse.setRole(user.getRole());
        userResponse.setCreatedAt(user.getCreatedAt().toString());
        userResponse.setUpdatedAt(user.getUpdatedAt().toString());
        return userResponse;
    }

    public ResponseEntity<UserResponse> getUserProfile(String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        UserResponse userResponse = getUserResponse(user);
        return ResponseEntity.ok(userResponse);
    }

    public ResponseEntity<Boolean> validateUser(String userId) {
        Boolean userExists = userRepo.existsById(userId);
        return ResponseEntity.ok(userExists);
    }
}
