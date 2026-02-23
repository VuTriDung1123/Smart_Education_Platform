package com.sep.core_service.controller;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Subject;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.SubjectRepository;
import com.sep.core_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classrooms")
public class ClassroomController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllClassrooms() {
        List<Map<String, Object>> result = classroomRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("classCode", c.getClassCode());
            map.put("subject", c.getSubject().getName());
            map.put("subjectCode", c.getSubject().getSubjectCode());
            map.put("credits", c.getSubject().getCredits());
            map.put("lecturer", c.getLecturer() != null ? c.getLecturer().getFullName() : "Chưa phân công");
            map.put("studentCount", c.getStudents() != null ? c.getStudents().size() : 0);
            
            // 🔥 TRẢ VỀ DANH SÁCH ID SINH VIÊN TRONG LỚP ĐỂ FRONTEND KIỂM TRA
            List<String> studentIds = c.getStudents() != null ? 
                c.getStudents().stream().map(u -> u.getId().toString()).collect(Collectors.toList()) : 
                new ArrayList<>();
            map.put("enrolledStudentIds", studentIds);
            
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createClassroom(@RequestBody Map<String, String> payload) {
        String classCode = payload.get("classCode");
        UUID subjectId = UUID.fromString(payload.get("subjectId"));
        String lecturerIdStr = payload.get("lecturerId");

        if (classroomRepository.existsByClassCode(classCode)) return ResponseEntity.badRequest().body("Mã lớp đã tồn tại!");

        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new RuntimeException("Không tìm thấy môn học!"));

        Classroom classroom = new Classroom();
        classroom.setClassCode(classCode);
        classroom.setSubject(subject);

        if (lecturerIdStr != null && !lecturerIdStr.isEmpty()) {
            User lecturer = userRepository.findById(UUID.fromString(lecturerIdStr)).orElseThrow();
            classroom.setLecturer(lecturer);
        }
        classroomRepository.save(classroom);
        return ResponseEntity.ok("Tạo lớp thành công!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassroom(@PathVariable UUID id) {
        classroomRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa lớp học!");
    }

    // ==========================================
    // 🔥 TÍNH NĂNG CỦA SINH VIÊN: ĐĂNG KÝ VÀ HỦY
    // ==========================================

    @PostMapping("/{classId}/students/{studentId}")
    public ResponseEntity<?> addStudentToClass(@PathVariable UUID classId, @PathVariable UUID studentId) {
        Classroom classroom = classroomRepository.findById(classId).orElseThrow(() -> new RuntimeException("Lớp không tồn tại!"));
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại!"));

        if (classroom.getStudents() == null) classroom.setStudents(new HashSet<>());

        if (classroom.getStudents().contains(student)) {
            return ResponseEntity.badRequest().body("Bạn đã đăng ký lớp này rồi!");
        }

        // CHẶN CỨNG: TỐI ĐA 10 SINH VIÊN
        if (classroom.getStudents().size() >= 10) {
            return ResponseEntity.badRequest().body("Rất tiếc! Lớp học đã đạt số lượng tối đa (10/10).");
        }

        classroom.getStudents().add(student);
        classroomRepository.save(classroom);
        return ResponseEntity.ok("Đăng ký vào lớp thành công!");
    }

    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromClass(@PathVariable UUID classId, @PathVariable UUID studentId) {
        Classroom classroom = classroomRepository.findById(classId).orElseThrow(() -> new RuntimeException("Lớp không tồn tại!"));
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại!"));

        if (classroom.getStudents() != null && classroom.getStudents().contains(student)) {
            classroom.getStudents().remove(student);
            classroomRepository.save(classroom);
            return ResponseEntity.ok("Đã hủy đăng ký môn học!");
        }
        return ResponseEntity.badRequest().body("Bạn chưa đăng ký lớp này!");
    }
}