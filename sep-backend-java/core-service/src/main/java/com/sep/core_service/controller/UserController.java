package com.sep.core_service.controller;

import com.sep.core_service.entity.User;
import com.sep.core_service.service.UserService; // Quan trọng để hết lỗi UserService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*; // Quan trọng để hết lỗi GetMapping
import java.util.List; // Quan trọng để hết lỗi List

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService; // Đã tiêm UserService vào thay cho Repository

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @GetMapping
    public List<User> getAll() {
        return userService.getAllUsers();
    }
}