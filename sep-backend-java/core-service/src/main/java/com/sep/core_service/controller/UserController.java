package com.sep.core_service.controller;

import com.sep.core_service.entity.Role;
import com.sep.core_service.entity.User;
import com.sep.core_service.service.UserService;
import com.sep.core_service.repository.RoleRepository;
import com.sep.core_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // 1. Giữ nguyên kiến trúc Service cực chuẩn của Dũng
    @Autowired 
    private UserService userService; 

    // 2. Bổ sung các công cụ cần thiết cho tính năng của Admin
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // 🔥 API CŨ CỦA BẠN: Đăng ký tự do
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    // 🔥 API CŨ CỦA BẠN: Lấy danh sách hiển thị lên bảng
    @GetMapping
    public List<User> getAll() {
        return userService.getAllUsers();
    }

    // 🔥 API MỚI: Dành riêng cho giao diện Admin bấm nút "+ Thêm tài khoản mới"
    @PostMapping("/create-by-admin")
    public User createUserByAdmin(@RequestBody Map<String, String> requestData) {
        String username = requestData.get("username");
        String password = requestData.get("password");
        String fullName = requestData.get("fullName");
        String email = requestData.get("email");
        String roleName = requestData.get("role");

        // Kiểm tra trùng lặp tên đăng nhập
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // Tìm Quyền chuẩn xác trong Database
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền: " + roleName));

        // Tạo User mới với mật khẩu đã được băm (mã hóa) an toàn
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        return userRepository.save(user);
    }
}