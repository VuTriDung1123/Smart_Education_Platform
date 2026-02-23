package com.sep.core_service.controller;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Subject;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.SubjectRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private UserRepository userRepository;

    // 1. LẤY DANH SÁCH LỚP HỌC (Dùng Map để tránh lỗi vòng lặp JSON)
    @GetMapping
    public ResponseEntity<?> getAllClassrooms() {
        List<Map<String, Object>> result = classroomRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("classCode", c.getClassCode());
            map.put("subject", c.getSubject().getName());
            map.put("subjectCode", c.getSubject().getSubjectCode());
            map.put("lecturer", c.getLecturer() != null ? c.getLecturer().getFullName() : "Chưa phân công");
            map.put("studentCount", c.getStudents() != null ? c.getStudents().size() : 0);
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    // 2. ADMIN TẠO LỚP HỌC & PHÂN CÔNG GIẢNG VIÊN
    @PostMapping
    public ResponseEntity<?> createClassroom(@RequestBody Map<String, String> payload) {
        String classCode = payload.get("classCode");
        UUID subjectId = UUID.fromString(payload.get("subjectId"));
        String lecturerIdStr = payload.get("lecturerId");

        if (classroomRepository.existsByClassCode(classCode)) {
            return ResponseEntity.badRequest().body("Mã lớp đã tồn tại!");
        }

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học!"));

        Classroom classroom = new Classroom();
        classroom.setClassCode(classCode);
        classroom.setSubject(subject);

        // Nếu có chọn giảng viên thì phân công luôn
        if (lecturerIdStr != null && !lecturerIdStr.isEmpty()) {
            User lecturer = userRepository.findById(UUID.fromString(lecturerIdStr))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên!"));
            classroom.setLecturer(lecturer);
        }

        classroomRepository.save(classroom);
        return ResponseEntity.ok("Tạo lớp thành công!");
    }

    // 3. XÓA LỚP
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassroom(@PathVariable UUID id) {
        classroomRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa lớp học!");
    }

    // ========================================================
    // 🔥 LOGIC GIỚI HẠN 10 SINH VIÊN (Sẽ dùng cho trang Sinh viên sau)
    // ========================================================
    @PostMapping("/{classId}/students/{studentId}")
    public ResponseEntity<?> addStudentToClass(@PathVariable UUID classId, @PathVariable UUID studentId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học!"));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

        // Khởi tạo danh sách nếu null
        if (classroom.getStudents() == null) {
            classroom.setStudents(new HashSet<>());
        }

        // KIỂM TRA GIỚI HẠN 10 NGƯỜI
        if (classroom.getStudents().size() >= 10) {
            return ResponseEntity.badRequest().body("Lỗi: Lớp học đã đạt số lượng tối đa (10/10 sinh viên)!");
        }

        classroom.getStudents().add(student);
        classroomRepository.save(classroom);
        
        return ResponseEntity.ok("Thêm sinh viên vào lớp thành công (" + classroom.getStudents().size() + "/10)");
    }
}