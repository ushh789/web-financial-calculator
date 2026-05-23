package com.example.demo.users;

import java.util.Optional;
import java.util.UUID;

import org.jspecify.annotations.NonNull;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(@NonNull String email);

    Optional<User> findByUsername(@NonNull String username);
}
