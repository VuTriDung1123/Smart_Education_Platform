package com.sep.core_service.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lecturer/advanced")
public class LecturerAdvancedController {

    // ==========================================
    // 1. TẠO MÃ QR ĐIỂM DANH (Sử dụng API tạo ảnh QR siêu tốc)
    // ==========================================
    @PostMapping("/classes/{classId}/qr-attendance")
    public ResponseEntity<?> createQrAttendance(@PathVariable String classId) {
        String sessionId = UUID.randomUUID().toString();
        // Chuỗi dữ liệu chứa trong QR (Thực tế SV quét bằng app mobile sẽ đọc chuỗi này)
        String qrData = "SEP_ATTENDANCE_" + classId + "_" + sessionId + "_" + System.currentTimeMillis();
        
        // Dùng API tạo ảnh QR miễn phí, không cần cài thêm thư viện phức tạp
        String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" + qrData;

        Map<String, String> response = new HashMap<>();
        response.put("sessionId", sessionId);
        response.put("qrUrl", qrUrl);
        response.put("expiresIn", "60"); // QR hết hạn sau 60s (chống quét hộ)
        
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 2. DASHBOARD THỐNG KÊ LỚP HỌC (Analytics)
    // ==========================================
    @GetMapping("/classes/{classId}/analytics")
    public ResponseEntity<?> getClassAnalytics(@PathVariable String classId) {
        Map<String, Object> data = new HashMap<>();
        
        // Dữ liệu cho Biểu đồ Cột (Phổ điểm)
        data.put("scoreDistribution", Arrays.asList(
            Map.of("name", "Yếu (0-4)", "count", 2),
            Map.of("name", "TB (4-6)", "count", 5),
            Map.of("name", "Khá (6-8)", "count", 15),
            Map.of("name", "Giỏi (8-10)", "count", 8)
        ));

        // Dữ liệu cho Biểu đồ Tròn (Chuyên cần)
        data.put("attendanceRate", Arrays.asList(
            Map.of("name", "Có mặt thường xuyên", "value", 85, "fill", "#28a745"),
            Map.of("name", "Vắng mặt nhiều", "value", 15, "fill", "#dc3545")
        ));

        data.put("averageScore", 7.2);
        data.put("riskStudents", 2);

        return ResponseEntity.ok(data);
    }
}