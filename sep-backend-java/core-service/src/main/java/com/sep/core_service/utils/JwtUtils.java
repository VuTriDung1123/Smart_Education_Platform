package com.sep.core_service.utils;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtils {

    // Đây là "Chìa khóa bí mật" để ký tên lên thẻ bài. 
    // Trong thực tế phải giấu kỹ, không được lộ.
    private static final String SECRET_KEY = "day_la_khoa_bi_mat_cuc_ky_dai_va_kho_doan_cua_sep_project_2026";
    
    // Thời hạn của thẻ: 24 giờ (tính bằng mili giây)
    private static final long EXPIRATION_TIME = 86400000L; 

    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // 1. Hàm tạo Token từ Username
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Hàm lấy Username từ Token (để biết ai đang gọi API)
    public String extractUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. Hàm kiểm tra Token có hợp lệ không
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false; // Token giả, hết hạn hoặc bị sửa đổi
        }
    }
}