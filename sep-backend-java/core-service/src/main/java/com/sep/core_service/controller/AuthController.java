package com.sep.core_service.controller;

import java.util.HashMap;
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
    public Map<String, String> login(@RequestBody Map<String, String> loginRequest) {
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

        // 4. Trả về
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Đăng nhập thành công!");
        return response;
    }
}