package com.fitnesstracker.userservice.dto;

import com.fitnesstracker.userservice.model.UserRole;
import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private UserRole role;
    private String createdAt;
    private String updatedAt;
}
