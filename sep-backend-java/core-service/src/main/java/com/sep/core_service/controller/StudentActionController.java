package com.sep.core_service.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Assignment;
import com.sep.core_service.entity.AssignmentSubmission;
import com.sep.core_service.entity.AttendanceRecord;
import com.sep.core_service.entity.AttendanceSession;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.AssignmentRepository;
import com.sep.core_service.repository.AssignmentSubmissionRepository;
import com.sep.core_service.repository.AttendanceRecordRepository;
import com.sep.core_service.repository.AttendanceSessionRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/students/actions") 
public class StudentActionController {

    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssignmentSubmissionRepository submissionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private AttendanceSessionRepository sessionRepository;
    @Autowired private AttendanceRecordRepository recordRepository;

    private Student getCurrentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        // Tự động khởi tạo hồ sơ nếu chưa có
        return studentRepository.findById(user.getId()).orElseGet(() -> {
            Student newStudent = new Student();
            newStudent.setUser(user);
            newStudent.setStudentCode(user.getStudentCode() != null ? user.getStudentCode() : "SV_CHUA_CAP_NHAT");
            newStudent.setEnrollmentYear(2023); 
            newStudent.setAcademicStatus("STUDYING");
            return studentRepository.save(newStudent);
        });
    }

    // ==========================================
    // 1. QUÉT MÃ QR ĐIỂM DANH (DB THẬT)
    // ==========================================
    @PostMapping("/attendance/scan")
    public ResponseEntity<?> scanQrAttendance(@RequestBody Map<String, String> payload) {
        String qrData = payload.get("qrData");
        if(qrData == null || qrData.isEmpty()) return ResponseEntity.badRequest().body("Mã QR không hợp lệ!");

        String[] parts = qrData.split("_");
        if(parts.length < 4) return ResponseEntity.badRequest().body("Mã QR bị sai định dạng!");

        try {
            UUID sessionId = UUID.fromString(parts[3]);
            AttendanceSession session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Phiên điểm danh không tồn tại!"));

            Student student = getCurrentStudent();

            AttendanceRecord record = new AttendanceRecord();
            record.setSession(session);
            record.setStudent(student);
            record.setFaceVerified(true); 
            record.setStatus("PRESENT"); 
            recordRepository.save(record);

            return ResponseEntity.ok("✅ Điểm danh thành công! Hệ thống đã ghi nhận bạn CÓ MẶT.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi điểm danh: " + e.getMessage());
        }
    }

    // ==========================================
    // 2. LẤY BÀI TẬP VÀ NỘP BÀI (DB THẬT)
    // ==========================================
    @GetMapping("/classes/{classId}/assignments")
    public ResponseEntity<?> getClassAssignments(@PathVariable UUID classId) {
        Student student = getCurrentStudent();
        
        // Quét lấy danh sách bài tập từ DB thật
        List<Assignment> assignments = assignmentRepository.findByClassroomId(classId);

        List<Map<String, Object>> result = assignments.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId().toString());
            map.put("title", a.getTitle());
            map.put("description", a.getDescription());
            map.put("deadline", a.getDeadline() != null ? a.getDeadline().toString() : null);

            // Truy vấn xem sinh viên này đã nộp bài này chưa
            Optional<AssignmentSubmission> sub = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), student.getId());
            map.put("status", sub.isPresent() ? "SUBMITTED" : "PENDING");

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable UUID assignmentId, @RequestBody Map<String, String> payload) {
        Student student = getCurrentStudent();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập!"));

        String fileUrl = payload.get("fileUrl");

        // Tìm xem đã nộp chưa (Update link mới hoặc Tạo mới record)
        AssignmentSubmission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElse(new AssignmentSubmission());
        
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setFileUrl(fileUrl);
        submission.setSubmittedAt(LocalDateTime.now());
        
        // Check thời gian nộp trễ hạn
        if (assignment.getDeadline() != null && submission.getSubmittedAt().isAfter(assignment.getDeadline())) {
            submission.setStatus("LATE");
        } else {
            submission.setStatus("ON_TIME");
        }
        
        submissionRepository.save(submission);
        return ResponseEntity.ok("✅ Đã lưu bài làm vào Database thành công!");
    }
}