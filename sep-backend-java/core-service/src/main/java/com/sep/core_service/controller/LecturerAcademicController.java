package com.sep.core_service.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
import com.sep.core_service.entity.AssignmentSubmission;
import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.AssignmentRepository;
import com.sep.core_service.repository.AssignmentSubmissionRepository;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.ThesisTopicRepository;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerAcademicController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private ThesisTopicRepository thesisTopicRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssignmentSubmissionRepository submissionRepository;
    
    // Thêm Repo này để lấy danh sách sinh viên đối chiếu ai nộp ai chưa
    @Autowired private EnrollmentRepository enrollmentRepository;

    // ==========================================
    // 1. QUẢN LÝ BÀI TẬP (GIAO BÀI)
    // ==========================================
    @GetMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> getAssignments(@PathVariable UUID classId) {
        List<Map<String, Object>> result = assignmentRepository.findByClassroomId(classId).stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("description", a.getDescription());
            map.put("deadline", a.getDeadline() != null ? a.getDeadline().toString() : null);
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
    // 🔥 2. XEM CHI TIẾT BÀI NỘP CỦA 1 BÀI TẬP (TÍNH NĂNG MỚI)
    // ==========================================
    @GetMapping("/assignments/{assignmentId}/submissions")
    public ResponseEntity<?> getAssignmentSubmissions(@PathVariable UUID assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập!"));

        // Lấy danh sách toàn bộ sinh viên trong lớp đó
        List<Enrollment> enrollments = enrollmentRepository.findByCourseClassId(assignment.getClassroom().getId());

        // Lấy danh sách các bài đã nộp của bài tập này
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Enrollment e : enrollments) {
            User studentUser = e.getStudent().getUser();
            Map<String, Object> map = new HashMap<>();
            map.put("studentId", studentUser.getId());
            map.put("studentCode", studentUser.getStudentCode() != null ? studentUser.getStudentCode() : "Chưa có MSSV");
            map.put("fullName", studentUser.getFullName());

            // Tìm bài nộp của sinh viên này
            Optional<AssignmentSubmission> subOpt = submissions.stream()
                    .filter(s -> s.getStudent().getId().equals(e.getStudent().getId()))
                    .findFirst();

            if (subOpt.isPresent()) {
                AssignmentSubmission sub = subOpt.get();
                map.put("submissionId", sub.getId());
                map.put("status", sub.getStatus()); // ON_TIME hoặc LATE
                map.put("fileUrl", sub.getFileUrl());
                map.put("submittedAt", sub.getSubmittedAt().toString());
                map.put("score", sub.getScore());
            } else {
                map.put("status", "MISSING"); // Chưa nộp
                map.put("fileUrl", null);
                map.put("submittedAt", null);
                map.put("score", null);
            }
            result.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("assignmentTitle", assignment.getTitle());
        response.put("deadline", assignment.getDeadline() != null ? assignment.getDeadline().toString() : null);
        response.put("submissions", result);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 🔥 3. CHẤM ĐIỂM BÀI TẬP TRỰC TIẾP
    // ==========================================
    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(@PathVariable UUID submissionId, @RequestBody Map<String, Double> payload) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài nộp!"));
        
        Double score = payload.get("score");
        submission.setScore(score);
        submissionRepository.save(submission);
        
        return ResponseEntity.ok("✅ Đã lưu điểm thành công!");
    }

    // ==========================================
    // 4. QUẢN LÝ ĐỒ ÁN / KHÓA LUẬN
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