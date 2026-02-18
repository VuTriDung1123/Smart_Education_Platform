package com.sep.core_service.config;

import java.io.IOException;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.sep.core_service.utils.JwtUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // 1. Lấy token từ Header "Authorization"
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // Token thường có dạng: "Bearer eyJhbGciOi..."
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cắt bỏ chữ "Bearer "
            username = jwtUtils.extractUsername(token); // Lấy tên người dùng
        }

        // 2. Nếu có token và chưa được xác thực
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Kiểm tra token có hợp lệ không
            if (jwtUtils.validateToken(token)) {
                // Tạo đối tượng xác thực (Authentication)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, new ArrayList<>()); // new ArrayList<>() là quyền hạn (Roles), tạm để trống
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Xác nhận: "Ok, người này hợp lệ, cho qua!"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 3. Cho phép request đi tiếp vào Controller
        filterChain.doFilter(request, response);
    }
}