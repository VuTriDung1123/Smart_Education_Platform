package com.sep.core_service.controller;

import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.CourseClass;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.GradeComponent;
import com.sep.core_service.entity.GradeScore;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.CourseClassRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.GradeComponentRepository;
import com.sep.core_service.repository.GradeScoreRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.UserRepository; // Thêm dòng này

@RestController
@RequestMapping("/api/lecturer")
public class LecturerController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private GradeScoreRepository gradeScoreRepository;
    @Autowired private GradeComponentRepository componentRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private CourseClassRepository courseClassRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository; // Thêm dòng này

    // ==========================================
    // 1. LẤY DANH SÁCH LỚP HỌC (Sử dụng PathVariable)
    // ==========================================
    @GetMapping("/{lecturerId}/my-classes") // Đổi endpoint
    public ResponseEntity<?> getMyClasses(@PathVariable UUID lecturerId) {
        
        // Không dùng SecurityContextHolder nữa, lấy trực tiếp từ DB
        User currentLecturer = userRepository.findById(lecturerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giảng viên"));

        List<Map<String, Object>> result = classroomRepository.findByLecturerId(currentLecturer.getId()).stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("classId", c.getId());
            map.put("classCode", c.getClassCode());
            map.put("subjectName", c.getSubject().getName());
            map.put("studentCount", c.getStudents() != null ? c.getStudents().size() : 0);
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // 2. LẤY DANH SÁCH SINH VIÊN & ĐIỂM
    // ==========================================
    @GetMapping("/classes/{classId}/students")
    public ResponseEntity<?> getStudentsInClass(@PathVariable UUID classId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        List<Map<String, Object>> studentsData = new ArrayList<>();

        if (classroom.getStudents() != null) {
            for (User user : classroom.getStudents()) {
                Map<String, Object> sMap = new HashMap<>();
                sMap.put("studentId", user.getId());
                sMap.put("studentCode", user.getStudentCode() != null ? user.getStudentCode() : "Chưa có MSSV");
                sMap.put("fullName", user.getFullName());

                Double processScore = null;
                Double finalScore = null;

                List<Enrollment> enrollments = enrollmentRepository.findByStudent_User_Id(user.getId());
                Optional<Enrollment> currentEnrollment = enrollments.stream()
                        .filter(e -> e.getCourseClass().getSubject().getId().equals(classroom.getSubject().getId()))
                        .findFirst();

                if (currentEnrollment.isPresent()) {
                    List<GradeScore> scores = gradeScoreRepository.findByEnrollmentId(currentEnrollment.get().getId());
                    for (GradeScore gs : scores) {
                        if (gs.getComponent().getName().toUpperCase().contains("QUÁ TRÌNH")) {
                            processScore = gs.getScore();
                        } else if (gs.getComponent().getName().toUpperCase().contains("THI")) {
                            finalScore = gs.getScore();
                        }
                    }
                }

                sMap.put("processScore", processScore);
                sMap.put("finalScore", finalScore);
                studentsData.add(sMap);
            }
        }
        return ResponseEntity.ok(studentsData);
    }

    // ==========================================
    // 3. API CHẤM ĐIỂM
    // ==========================================
    @PostMapping("/classes/{classId}/students/{studentId}/grades")
    public ResponseEntity<?> saveGrades(@PathVariable UUID classId, @PathVariable UUID studentId, @RequestBody Map<String, Double> payload) {
        Classroom classroom = classroomRepository.findById(classId).orElseThrow();
        User user = classroom.getStudents().stream().filter(u -> u.getId().equals(studentId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Sinh viên không thuộc lớp này"));

        Student student = studentRepository.findById(studentId).orElseGet(() -> {
            Student s = new Student(); s.setUser(user); 
            s.setStudentCode(user.getStudentCode()); s.setEnrollmentYear(2023); 
            return studentRepository.save(s);
        });

        CourseClass courseClass = courseClassRepository.findAll().stream()
                .filter(cc -> cc.getSubject().getId().equals(classroom.getSubject().getId()))
                .findFirst()
                .orElseGet(() -> {
                    CourseClass cc = new CourseClass();
                    cc.setSubject(classroom.getSubject());
                    cc.setSemester("HK1"); cc.setAcademicYear("2024-2025");
                    return courseClassRepository.save(cc);
                });

        Enrollment enrollment = enrollmentRepository.findByStudent_User_Id(studentId).stream()
                .filter(e -> e.getCourseClass().getId().equals(courseClass.getId()))
                .findFirst()
                .orElseGet(() -> {
                    Enrollment e = new Enrollment();
                    e.setStudent(student); e.setCourseClass(courseClass); e.setEnrollmentDate(LocalDate.now());
                    return enrollmentRepository.save(e);
                });

        GradeComponent processComp = componentRepository.findAll().stream().filter(c -> c.getName().contains("QUÁ TRÌNH")).findFirst().orElseGet(() -> {
            GradeComponent gc = new GradeComponent(); gc.setName("ĐIỂM QUÁ TRÌNH"); gc.setWeight(0.4); return componentRepository.save(gc);
        });
        GradeComponent finalComp = componentRepository.findAll().stream().filter(c -> c.getName().contains("THI")).findFirst().orElseGet(() -> {
            GradeComponent gc = new GradeComponent(); gc.setName("ĐIỂM THI CUỐI KỲ"); gc.setWeight(0.6); return componentRepository.save(gc);
        });

        saveOrUpdateGrade(enrollment, processComp, payload.get("processScore"));
        saveOrUpdateGrade(enrollment, finalComp, payload.get("finalScore"));

        return ResponseEntity.ok("Cập nhật điểm thành công!");
    }

    private void saveOrUpdateGrade(Enrollment enrollment, GradeComponent component, Double scoreVal) {
        if (scoreVal == null) return;
        GradeScore score = gradeScoreRepository.findByEnrollmentId(enrollment.getId()).stream()
                .filter(gs -> gs.getComponent().getId().equals(component.getId()))
                .findFirst().orElse(new GradeScore());
        score.setEnrollment(enrollment);
        score.setComponent(component);
        score.setScore(scoreVal);
        gradeScoreRepository.save(score);
    }
}