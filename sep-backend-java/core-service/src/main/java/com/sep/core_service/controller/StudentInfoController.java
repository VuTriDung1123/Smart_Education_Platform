package com.sep.core_service.controller;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.*;
import com.sep.core_service.repository.*;

@RestController
@RequestMapping("/api/students/info")
public class StudentInfoController {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;

    private Student getCurrentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
        return studentRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sinh viên"));
    }

    // ==========================================
    // 1. THỜI KHÓA BIỂU TRONG TUẦN (QUERY TỪ DB THẬT)
    // ==========================================
    @GetMapping("/timetable")
    public ResponseEntity<?> getTimetable() {
        Student student = getCurrentStudent();
        
        // Lấy danh sách các lớp sinh viên đang thực học (ENROLLED)
        List<Enrollment> enrollments = enrollmentRepository.findByStudent_User_Id(student.getId()).stream()
                .filter(e -> "ENROLLED".equals(e.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> timetable = enrollments.stream().map(e -> {
            CourseClass c = e.getCourseClass();
            Map<String, Object> map = new HashMap<>();
            
            // Lấy trực tiếp các trường mà bạn đã khai báo trong entity CourseClass
            map.put("dayOfWeek", c.getDayOfWeek() != null ? c.getDayOfWeek() : 2); // Default là T2 nếu chưa xếp
            map.put("session", c.getSession() != null ? c.getSession() : 1);       // Default là Ca 1 nếu chưa xếp
            map.put("subject", c.getSubject().getName());
            map.put("code", c.getSubject().getSubjectCode());
            map.put("tiet", c.getTiet() != null ? c.getTiet() : "1 - 3");
            map.put("time", c.getTime() != null ? c.getTime() : "06:45 - 09:15");
            map.put("room", c.getRoom() != null ? c.getRoom() : "Phòng chờ");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(timetable);
    }

    // ==========================================
    // 2. CHƯƠNG TRÌNH KHUNG (Tạm mock, làm ở Giai đoạn 3)
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
    // 3. HỒ SƠ CÁ NHÂN & BẢNG ĐIỂM
    // ==========================================
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Student student = getCurrentStudent();
        User user = student.getUser();
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("major", user.getMajor() != null ? user.getMajor() : "Công nghệ Thông tin");
        profile.put("batch", user.getBatch() != null ? user.getBatch() : "Khóa K22 (2022-2026)");
        profile.put("email", user.getEmail() != null ? user.getEmail() : "student@ut.edu.vn");
        profile.put("phone", "Chưa cập nhật");
        profile.put("status", student.getAcademicStatus() != null ? student.getAcademicStatus() : "Đang học");
        return ResponseEntity.ok(profile);
    }
}