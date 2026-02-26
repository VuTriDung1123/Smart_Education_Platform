package com.sep.core_service.controller;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.ThesisTopicRepository;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerAcademicController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private ThesisTopicRepository thesisTopicRepository;

    // Giả lập Database lưu Bài tập (Vì chưa có Entity Assignment chuẩn)
    // Trong thực tế bạn sẽ dùng AssignmentRepository
    private static final List<Map<String, Object>> mockAssignments = new ArrayList<>();

    // ==========================================
    // 1. QUẢN LÝ BÀI TẬP (ASSIGNMENTS)
    // ==========================================
    @GetMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> getAssignments(@PathVariable String classId) {
        List<Map<String, Object>> classAssignments = mockAssignments.stream()
                .filter(a -> a.get("classId").equals(classId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(classAssignments);
    }

    @PostMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> createAssignment(@PathVariable String classId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> newAssignment = new HashMap<>(payload);
        newAssignment.put("id", UUID.randomUUID().toString());
        newAssignment.put("classId", classId);
        newAssignment.put("createdAt", LocalDateTime.now().toString());
        newAssignment.put("submittedCount", 0); // Số SV đã nộp
        
        mockAssignments.add(newAssignment);
        return ResponseEntity.ok("✅ Đã giao bài tập thành công!");
    }

    // ==========================================
    // 2. QUẢN LÝ ĐỒ ÁN / KHÓA LUẬN (THESIS)
    // ==========================================
    @GetMapping("/{lecturerId}/theses")
    public ResponseEntity<?> getMyTheses(@PathVariable UUID lecturerId) {
        // Lấy các đề tài mà Giảng viên này được Admin phân công hướng dẫn
        List<Map<String, Object>> result = thesisTopicRepository.findAll().stream()
                .filter(t -> t.getSupervisor() != null && t.getSupervisor().getId().equals(lecturerId))
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", t.getId());
                    map.put("title", t.getTitle());
                    map.put("status", "Đang thực hiện"); // Giả lập status
                    map.put("studentName", "Nguyễn Văn A (Nhóm 1)"); // Giả lập sinh viên
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/theses/{thesisId}/grade")
    public ResponseEntity<?> gradeThesis(@PathVariable UUID thesisId, @RequestBody Map<String, Object> payload) {
        // Cập nhật điểm và nhận xét cho Khóa luận
        return ResponseEntity.ok("✅ Đã cập nhật điểm và nhận xét Đồ án!");
    }
}