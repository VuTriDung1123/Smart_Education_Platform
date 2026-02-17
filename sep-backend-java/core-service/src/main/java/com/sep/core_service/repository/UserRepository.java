package com.sep.core_service.repository;

import com.sep.core_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID; // Bắt buộc phải có dòng này

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // VS Code sẽ hết báo lỗi "Expected Domain ID type is UUID"
}