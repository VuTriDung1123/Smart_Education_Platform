package com.sep.core_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.User;
import com.sep.core_service.repository.UserRepository;
import com.sep.core_service.utils.JwtUtils;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtils jwtUtils;
    
    // Dùng cái này để kiểm tra mật khẩu (so sánh pass thường với pass băm trong DB)
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    // 🔥 ĐỔI Map<String, String> THÀNH Map<String, Object>
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        // 1. Tìm user trong DB
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại!"));

        // 2. So khớp mật khẩu
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Sai mật khẩu rồi bạn ơi!");
        }

        // 3. Nếu đúng hết -> In thẻ bài (Token)
        String token = jwtUtils.generateToken(username);

        // 🔥 Lấy danh sách quyền (Role) của User
        List<String> roles = new java.util.ArrayList<>();
        if (user.getRoles() != null) {
            user.getRoles().forEach(role -> roles.add(role.getName()));
        }
        
        
        // 4. Trả về
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("message", "Đăng nhập thành công!");
        response.put("fullName", user.getFullName()); // Trả về tên thật để hiển thị lời chào
        response.put("roles", roles); // Trả về mảng các quyền

        return response;
    }
}