package com.fitnesstracker.userservice.dto;

import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String keycloakId;
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String createdAt;
    private String updatedAt;
}
