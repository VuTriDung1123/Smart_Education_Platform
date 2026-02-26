package com.sep.core_service.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students/info")
public class StudentInfoController {

    // ==========================================
    // 1. THỜI KHÓA BIỂU TRONG TUẦN (MOCK DATA THEO GRID)
    // ==========================================
    @GetMapping("/timetable")
    public ResponseEntity<?> getTimetable() {
        // dayOfWeek: 2 (Thứ 2) -> 8 (Chủ nhật)
        // session: 1,2,3 (Sáng) - 4,5,6 (Chiều)
        List<Map<String, Object>> timetable = Arrays.asList(
            Map.of("dayOfWeek", 6, "session", 1, "subject", "Xử lý ảnh và thị giác máy tính", "code", "010112103609", "tiet", "1 - 3", "time", "06:45 - 09:15", "room", "ONLINE"),
            Map.of("dayOfWeek", 7, "session", 1, "subject", "Khai thác dữ liệu", "code", "010112204104", "tiet", "1 - 3", "time", "06:45 - 09:15", "room", "ONLINE"),
            Map.of("dayOfWeek", 4, "session", 4, "subject", "Điện toán đám mây", "code", "010112303907", "tiet", "10 - 12", "time", "14:50 - 17:20", "room", "ONLINE")
        );
        return ResponseEntity.ok(timetable);
    }

    // ==========================================
    // 2. CHƯƠNG TRÌNH KHUNG (LỘ TRÌNH)
    // ==========================================
    @GetMapping("/curriculum")
    public ResponseEntity<?> getCurriculum() {
        List<Map<String, Object>> curriculum = Arrays.asList(
            Map.of("semester", "Học kỳ 1", "subjects", Arrays.asList(
                Map.of("name", "Nhập môn CNTT", "credits", 2, "status", "PASSED"),
                Map.of("name", "Lập trình cơ bản", "credits", 3, "status", "PASSED")
            )),
            Map.of("semester", "Học kỳ 2", "subjects", Arrays.asList(
                Map.of("name", "Cấu trúc dữ liệu", "credits", 3, "status", "STUDYING"),
                Map.of("name", "Cơ sở dữ liệu", "credits", 3, "status", "NOT_STARTED")
            ))
        );
        return ResponseEntity.ok(curriculum);
    }

    // ==========================================
    // 3. HỒ SƠ CÁ NHÂN & BẢNG ĐIỂM (TRANSCRIPT)
    // ==========================================
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Map<String, Object> profile = new HashMap<>();
        profile.put("major", "Công nghệ Thông tin");
        profile.put("batch", "Khóa K22 (2022-2026)");
        profile.put("email", "student@ut.edu.vn");
        profile.put("phone", "0987654321");
        profile.put("status", "Đang học");
        return ResponseEntity.ok(profile);
    }
}