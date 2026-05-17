package com.fitnesstracker.userservice.repo;

import com.fitnesstracker.userservice.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<User, String> {
    Boolean existsByEmail(String email);

    User findByEmail(String email);
}
