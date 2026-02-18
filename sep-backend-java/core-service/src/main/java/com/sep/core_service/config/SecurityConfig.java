package com.sep.core_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired private JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF vì dùng API
            .authorizeHttpRequests(auth -> auth
                // 1. Cho phép tự do vào các trang này (không cần Token)
                .requestMatchers(
                        "/api/auth/**",           // Đăng nhập, Đăng ký
                        "/api/users/register",    // Đăng ký user
                        "/v3/api-docs/**",        // Tài liệu API
                        "/swagger-ui/**",         // Giao diện Swagger
                        "/swagger-ui.html"
                ).permitAll()
                
                // 2. Tất cả các trang khác: BẮT BUỘC PHẢI CÓ TOKEN
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không lưu Session
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); // Gắn bộ lọc JWT vào

        return http.build();
    }
    
    // Bean cần thiết để AuthController hoạt động
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}