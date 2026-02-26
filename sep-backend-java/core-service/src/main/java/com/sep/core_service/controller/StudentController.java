package com.sep.core_service.controller;

import java.util.Arrays;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.GradeScore;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.AnnouncementRepository;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.GradeScoreRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private GradeScoreRepository gradeScoreRepository;
    @Autowired private AnnouncementRepository announcementRepository;

    // ==========================================
    // API CŨ CỦA BẠN (Giữ nguyên 100%)
    // ==========================================
    @PostMapping("/enroll/{userId}")
    public Student enrollStudent(
            @PathVariable UUID userId,
            @RequestParam String studentCode,
            @RequestParam int year
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản User này!"));

        Student student = new Student();
        student.setUser(user); 
        student.setStudentCode(studentCode);
        student.setEnrollmentYear(year);
        student.setAcademicStatus("STUDYING");

        return studentRepository.save(student);
    }

    // ==========================================
    // CÁC API MỚI CHO GIAO DIỆN SINH VIÊN
    // ==========================================
    
    // 1. LẤY DANH SÁCH LỚP ĐANG HỌC
    @GetMapping("/my-classes")
    public ResponseEntity<?> getMyClasses() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentStudent = userRepository.findByUsername(auth.getName()).orElseThrow();

        List<Classroom> classes = classroomRepository.findAll().stream()
                .filter(c -> c.getStudents() != null && c.getStudents().contains(currentStudent))
                .collect(Collectors.toList());

        List<Map<String, Object>> result = classes.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("classId", c.getId());
            map.put("classCode", c.getClassCode());
            map.put("subjectName", c.getSubject().getName());
            map.put("lecturerName", c.getLecturer() != null ? c.getLecturer().getFullName() : "Chưa phân công");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 2. LẤY ĐIỂM CỦA 1 LỚP CỤ THỂ
    @GetMapping("/classes/{classId}/grades")
    public ResponseEntity<?> getMyGrades(@PathVariable UUID classId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentStudent = userRepository.findByUsername(auth.getName()).orElseThrow();
        Classroom classroom = classroomRepository.findById(classId).orElseThrow();

        Map<String, Double> grades = new HashMap<>();
        grades.put("processScore", null);
        grades.put("finalScore", null);

        List<Enrollment> enrollments = enrollmentRepository.findByStudent_User_Id(currentStudent.getId());
        Optional<Enrollment> currentEnrollment = enrollments.stream()
                .filter(e -> e.getCourseClass().getSubject().getId().equals(classroom.getSubject().getId()))
                .findFirst();

        if (currentEnrollment.isPresent()) {
            List<GradeScore> scores = gradeScoreRepository.findByEnrollmentId(currentEnrollment.get().getId());
            for (GradeScore gs : scores) {
                if (gs.getComponent().getName().toUpperCase().contains("QUÁ TRÌNH")) grades.put("processScore", gs.getScore());
                else if (gs.getComponent().getName().toUpperCase().contains("THI")) grades.put("finalScore", gs.getScore());
            }
        }
        return ResponseEntity.ok(grades);
    }

    // 3. LẤY THÔNG BÁO TỪ GIẢNG VIÊN
    @GetMapping("/classes/{classId}/announcements")
    public ResponseEntity<?> getAnnouncements(@PathVariable UUID classId) {
        return ResponseEntity.ok(announcementRepository.findByClassroomIdOrderByCreatedAtDesc(classId));
    }

    // 4. LẤY DỮ LIỆU DASHBOARD NĂNG LỰC
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("gpa", 3.25);
        data.put("credits", 85);
        data.put("radarData", Arrays.asList(
            Map.of("subject", "Lập trình", "A", 90, "fullMark", 100),
            Map.of("subject", "Toán Logic", "A", 75, "fullMark", 100),
            Map.of("subject", "Ngoại ngữ", "A", 85, "fullMark", 100),
            Map.of("subject", "Kỹ năng mềm", "A", 95, "fullMark", 100),
            Map.of("subject", "Chuyên ngành", "A", 80, "fullMark", 100)
        ));
        return ResponseEntity.ok(data);
    }
}