package com.sep.core_service.controller;

import java.util.ArrayList;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.GradeScore;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.StudentSubjectGrade;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.AnnouncementRepository;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.GradeScoreRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.StudentSubjectGradeRepository;
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
    @Autowired private StudentSubjectGradeRepository studentSubjectGradeRepository;

    private Student getCurrentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return studentRepository.findById(user.getId()).orElseThrow();
    }

    // ==========================================
    // CÁC API LẤY DANH SÁCH LỚP, ĐIỂM, THÔNG BÁO
    // ==========================================
    @GetMapping("/my-classes")
    public ResponseEntity<?> getMyClasses() {
        User currentStudent = getCurrentStudent().getUser();
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

    @GetMapping("/classes/{classId}/grades")
    public ResponseEntity<?> getMyGrades(@PathVariable UUID classId) {
        User currentStudent = getCurrentStudent().getUser();
        Classroom classroom = classroomRepository.findById(classId).orElseThrow();

        Map<String, Double> grades = new HashMap<>();
        grades.put("processScore", null);
        grades.put("finalScore", null);

        Optional<Enrollment> currentEnrollment = enrollmentRepository.findByStudent_User_Id(currentStudent.getId()).stream()
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

    @GetMapping("/classes/{classId}/announcements")
    public ResponseEntity<?> getAnnouncements(@PathVariable UUID classId) {
        return ResponseEntity.ok(announcementRepository.findByClassroomIdOrderByCreatedAtDesc(classId));
    }

    // ==========================================
    // 🔥 DASHBOARD NĂNG LỰC HỌC TẬP (DB THẬT 100%)
    // ==========================================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Student student = getCurrentStudent();
        
        // 1. Lấy toàn bộ lịch sử điểm của sinh viên này
        List<StudentSubjectGrade> grades = studentSubjectGradeRepository.findByStudentId(student.getId());

        double totalScore4 = 0;
        int totalCredits = 0;
        int passedCredits = 0;
        
        // Map dùng để gom nhóm điểm theo Thể loại môn (Category) vẽ Radar chart
        Map<String, double[]> categoryStats = new HashMap<>();

        for (StudentSubjectGrade g : grades) {
            int credits = g.getCreditsAtTime();
            totalCredits += credits;
            totalScore4 += (g.getScore4() != null ? g.getScore4() : 0) * credits;

            // Môn qua môn (Điểm hệ 10 >= 4.0)
            if (g.getScore10() != null && g.getScore10() >= 4.0) {
                passedCredits += credits;
            }

            // Gom điểm theo Category (Lập trình, Tiếng Anh, Toán...)
            String category = g.getSubject().getCategory();
            if (category == null || category.isEmpty()) category = "Khác";

            categoryStats.putIfAbsent(category, new double[]{0, 0});
            categoryStats.get(category)[0] += (g.getScore10() != null ? g.getScore10() : 0); // Tổng điểm
            categoryStats.get(category)[1] += 1; // Số lượng môn trong category
        }

        // 2. Tính GPA (Thang điểm 4)
        double gpa = totalCredits > 0 ? (totalScore4 / totalCredits) : 0.0;
        gpa = Math.round(gpa * 100.0) / 100.0; // Làm tròn 2 chữ số

        // 3. Xử lý dữ liệu vẽ Radar Chart (Thang điểm 100 cho đẹp)
        List<Map<String, Object>> radarData = new ArrayList<>();
        if (categoryStats.isEmpty()) {
             radarData.add(Map.of("subject", "Chưa có dữ liệu", "A", 0, "fullMark", 100));
        } else {
            for (Map.Entry<String, double[]> entry : categoryStats.entrySet()) {
                double avgScore10 = entry.getValue()[1] > 0 ? (entry.getValue()[0] / entry.getValue()[1]) : 0;
                radarData.add(Map.of(
                    "subject", entry.getKey(), 
                    "A", Math.round(avgScore10 * 10), // Đổi sang thang 100 (VD: 8.5 -> 85)
                    "fullMark", 100
                ));
            }
        }

        Map<String, Object> data = new HashMap<>();
        data.put("gpa", gpa);
        data.put("credits", passedCredits);
        data.put("radarData", radarData);
        return ResponseEntity.ok(data);
    }
}