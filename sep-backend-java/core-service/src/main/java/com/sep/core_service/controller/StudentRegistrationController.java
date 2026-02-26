package com.sep.core_service.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students/registration")
public class StudentRegistrationController {

    // ==========================================
    // 1. LẤY DANH SÁCH LỚP MỞ ĐỂ ĐĂNG KÝ
    // ==========================================
    @GetMapping("/available-classes")
    public ResponseEntity<?> getAvailableClasses() {
        // Dữ liệu mô phỏng các lớp đang mở trong học kỳ
        List<Map<String, Object>> classes = Arrays.asList(
            Map.of("id", "CLASS_001", "code", "IT001", "name", "Cấu trúc dữ liệu & Giải thuật", "credits", 3, "schedule", "Thứ 2 (Tiết 1-3)", "prerequisite", "Lập trình cơ bản", "status", "OPEN", "remaining", 15),
            Map.of("id", "CLASS_002", "code", "IT002", "name", "Trí tuệ nhân tạo (AI)", "credits", 3, "schedule", "Thứ 4 (Tiết 4-6)", "prerequisite", "Toán rời rạc", "status", "OPEN", "remaining", 5),
            Map.of("id", "CLASS_003", "code", "ENG01", "name", "Tiếng Anh chuyên ngành", "credits", 2, "schedule", "Thứ 6 (Tiết 7-9)", "prerequisite", "Không", "status", "FULL", "remaining", 0)
        );
        return ResponseEntity.ok(classes);
    }

    // ==========================================
    // 2. AI RECOMMENDATION - GỢI Ý MÔN NÊN HỌC
    // ==========================================
    @GetMapping("/ai-recommendations")
    public ResponseEntity<?> getAiRecommendations() {
        // Thuật toán AI giả lập: Dựa vào điểm GPA, môn đã qua để đưa ra lời khuyên
        List<Map<String, Object>> recommendations = Arrays.asList(
            Map.of("code", "IT001", "name", "Cấu trúc dữ liệu & Giải thuật", "match", 98, "reason", "Bạn đã đạt điểm A môn Lập trình cơ bản. Môn này là bắt buộc tiếp theo trong lộ trình.", "type", "BẮT BUỘC"),
            Map.of("code", "IT002", "name", "Trí tuệ nhân tạo (AI)", "match", 85, "reason", "Phù hợp với định hướng chuyên ngành 'Khoa học Dữ liệu' của bạn. Xu hướng ngành đang rất hot.", "type", "GỢI Ý MỞ RỘNG")
        );
        return ResponseEntity.ok(recommendations);
    }

    // ==========================================
    // 3. ĐĂNG KÝ MÔN HỌC (Có kiểm tra điều kiện)
    // ==========================================
    @PostMapping("/enroll/{classId}")
    public ResponseEntity<?> enrollClass(@PathVariable String classId) {
        if(classId.equals("CLASS_003")) {
            return ResponseEntity.badRequest().body("Lớp học đã đầy sĩ số! Bạn có muốn vào Waitlist (Danh sách chờ) không?");
        }
        // Trong thực tế sẽ gọi EnrollmentRepository để lưu vào DB
        return ResponseEntity.ok("✅ Đăng ký thành công! Hệ thống đã thêm môn học vào Thời khóa biểu của bạn.");
    }
}