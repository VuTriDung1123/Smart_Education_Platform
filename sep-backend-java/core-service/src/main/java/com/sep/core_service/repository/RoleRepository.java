package com.sep.core_service.repository;

import com.sep.core_service.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Thêm hàm tìm Quyền theo tên (Ví dụ: tìm "ADMIN")
    Optional<Role> findByName(String name);
}