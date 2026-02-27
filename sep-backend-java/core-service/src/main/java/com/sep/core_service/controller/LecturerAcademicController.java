package com.sep.core_service.controller;

import java.time.LocalDateTime;
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

import com.sep.core_service.entity.Assignment;
import com.sep.core_service.entity.Classroom;
import com.sep.core_service.repository.AssignmentRepository;
import com.sep.core_service.repository.AssignmentSubmissionRepository;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.ThesisTopicRepository;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerAcademicController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private ThesisTopicRepository thesisTopicRepository;
    
    // 🔥 ĐÃ THÊM REPOSITORY ĐỂ LƯU XUỐNG DB THẬT
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssignmentSubmissionRepository submissionRepository;

    // ==========================================
    // 1. QUẢN LÝ BÀI TẬP (DB THẬT 100%)
    // ==========================================
    @GetMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> getAssignments(@PathVariable UUID classId) {
        List<Map<String, Object>> result = assignmentRepository.findByClassroomId(classId).stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("description", a.getDescription());
            map.put("deadline", a.getDeadline() != null ? a.getDeadline().toString() : null);
            
            // Đếm số lượng sinh viên đã nộp bài thật
            map.put("submittedCount", submissionRepository.findByAssignmentId(a.getId()).size());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> createAssignment(@PathVariable UUID classId, @RequestBody Map<String, Object> payload) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học!"));
        
        Assignment assignment = new Assignment();
        assignment.setClassroom(classroom);
        assignment.setTitle((String) payload.get("title"));
        assignment.setDescription((String) payload.get("description"));
        
        String deadlineStr = (String) payload.get("deadline");
        if (deadlineStr != null && !deadlineStr.isEmpty()) {
            assignment.setDeadline(LocalDateTime.parse(deadlineStr));
        }
        
        assignmentRepository.save(assignment);
        return ResponseEntity.ok("✅ Đã giao bài tập thành công (Lưu Database)!");
    }

    // ==========================================
    // 2. QUẢN LÝ ĐỒ ÁN / KHÓA LUẬN (Giữ nguyên)
    // ==========================================
    @GetMapping("/{lecturerId}/theses")
    public ResponseEntity<?> getMyTheses(@PathVariable UUID lecturerId) {
        List<Map<String, Object>> result = thesisTopicRepository.findAll().stream()
                .filter(t -> t.getSupervisor() != null && t.getSupervisor().getId().equals(lecturerId))
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", t.getId());
                    map.put("title", t.getTitle());
                    map.put("status", "Đang thực hiện"); 
                    map.put("studentName", "Nguyễn Văn A (Nhóm 1)"); 
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/theses/{thesisId}/grade")
    public ResponseEntity<?> gradeThesis(@PathVariable UUID thesisId, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok("✅ Đã cập nhật điểm và nhận xét Đồ án!");
    }
}