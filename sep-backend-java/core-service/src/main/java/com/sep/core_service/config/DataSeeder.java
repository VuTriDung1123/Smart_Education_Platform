package com.sep.core_service.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.sep.core_service.entity.Role;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.RoleRepository;
import com.sep.core_service.repository.UserRepository;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Gieo mầm 3 Quyền cơ bản
        Role adminRole = createRoleIfNotFound("ADMIN");
        Role lecturerRole = createRoleIfNotFound("LECTURER");
        Role studentRole = createRoleIfNotFound("STUDENT");

        // 2. Gieo mầm 6 Tài khoản (Mật khẩu chung là: 123456)
        
        // 👑 2 Tài khoản ADMIN
        createUserIfNotFound("admin1", "Trần Quản Trị", "admin1@sep.com", adminRole);
        createUserIfNotFound("admin2", "Lê Hệ Thống", "admin2@sep.com", adminRole);

        // 👨‍🏫 2 Tài khoản GIẢNG VIÊN
        createUserIfNotFound("gv01", "Nguyễn Giảng Viên 1", "gv1@sep.com", lecturerRole);
        createUserIfNotFound("gv02", "Phạm Giảng Viên 2", "gv2@sep.com", lecturerRole);

        // 🎓 2 Tài khoản SINH VIÊN
        createUserIfNotFound("sv01", "Vũ Sinh Viên 1", "sv1@sep.com", studentRole);
        createUserIfNotFound("sv02", "Hoàng Sinh Viên 2", "sv2@sep.com", studentRole);
    }

    // Hàm hỗ trợ tạo Quyền
    private Role createRoleIfNotFound(String name) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            return roleRepository.save(role);
        });
    }

    // Hàm hỗ trợ tạo User
    private void createUserIfNotFound(String username, String fullName, String email, Role role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            // Mã hóa mật khẩu "123456" đúng chuẩn Security
            user.setPassword(passwordEncoder.encode("123456")); 
            user.setFullName(fullName);
            user.setEmail(email);
            user.setStatus("ACTIVE");
            user.setCreatedAt(LocalDateTime.now());
            
            // Gán quyền cho User
            Set<Role> roles = new HashSet<>(); 
            roles.add(role);
            user.setRoles(roles);
            
            userRepository.save(user);
            System.out.println("✅ Đã tạo tự động tài khoản: " + username + " (Quyền: " + role.getName() + ")");
        }
    }
}