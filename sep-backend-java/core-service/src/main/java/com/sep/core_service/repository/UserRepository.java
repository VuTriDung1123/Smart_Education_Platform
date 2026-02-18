package com.sep.core_service.repository;

import java.util.Optional;
import java.util.UUID; // Bắt buộc phải có dòng này

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
}