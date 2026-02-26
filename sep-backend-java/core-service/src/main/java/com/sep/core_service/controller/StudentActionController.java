package com.sep.core_service.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students/actions") // Dùng prefix này cho khớp với file service của bạn
public class StudentActionController {

    // ==========================================
    // 1. QUÉT MÃ QR ĐIỂM DANH
    // ==========================================
    @PostMapping("/attendance/scan")
    public ResponseEntity<?> scanQrAttendance(@RequestBody Map<String, String> payload) {
        String qrData = payload.get("qrData");
        // Logic thực tế: Parse chuỗi QR, kiểm tra Session ID xem còn hạn không, 
        // rồi update status "Có mặt" vào bảng Attendance.
        
        if(qrData == null || qrData.isEmpty()) {
            return ResponseEntity.badRequest().body("Mã QR không hợp lệ!");
        }
        
        return ResponseEntity.ok("✅ Điểm danh thành công! Hệ thống đã ghi nhận bạn có mặt.");
    }

    // ==========================================
    // 2. LẤY BÀI TẬP & NỘP BÀI
    // ==========================================
    @GetMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> getClassAssignments(@PathVariable String classId) {
        // Trả về dữ liệu mock (giả lập) để Frontend có cái hiển thị
        List<Map<String, Object>> mockAssignments = Arrays.asList(
            Map.of(
                "id", UUID.randomUUID().toString(),
                "title", "Bài tập lớn giữa kỳ",
                "description", "Viết báo cáo phân tích thiết kế hệ thống theo chuẩn UML.",
                "deadline", "2026-03-15T23:59:00",
                "status", "PENDING" // PENDING, SUBMITTED, LATE
            ),
            Map.of(
                "id", UUID.randomUUID().toString(),
                "title", "Bài tập thực hành 1",
                "description", "Tạo database và các bảng cơ bản cho đồ án.",
                "deadline", "2026-02-28T23:59:00",
                "status", "SUBMITTED"
            )
        );
        return ResponseEntity.ok(mockAssignments);
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable String assignmentId, @RequestBody Map<String, String> payload) {
        // Lẽ ra nhận MultipartFile, nhưng để demo nhanh ta nhận link Google Drive/Github
        String fileUrl = payload.get("fileUrl");
        return ResponseEntity.ok("✅ Đã nộp bài thành công! Version mới nhất đã được lưu.");
    }
}