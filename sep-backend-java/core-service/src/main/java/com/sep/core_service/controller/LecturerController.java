package com.sep.core_service.controller;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.GradeComponent;
import com.sep.core_service.entity.GradeScore;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.GradeComponentRepository;
import com.sep.core_service.repository.GradeScoreRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/lecturer")
public class LecturerController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private GradeScoreRepository gradeScoreRepository;
    @Autowired private GradeComponentRepository componentRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping("/{lecturerId}/my-classes")
    public ResponseEntity<?> getMyClasses(@PathVariable UUID lecturerId) {
        User currentLecturer = userRepository.findById(lecturerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giảng viên"));

        List<Map<String, Object>> result = classroomRepository.findByLecturerId(currentLecturer.getId()).stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("classId", c.getId());
            map.put("classCode", c.getClassCode());
            map.put("subjectName", c.getSubject().getName());
            
            // Đếm sĩ số thực tế từ bảng Enrollment
            int count = enrollmentRepository.findByCourseClassId(c.getId()).size();
            map.put("studentCount", count);
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/classes/{classId}/students")
    public ResponseEntity<?> getStudentsInClass(@PathVariable UUID classId) {
        // ĐÃ SỬA: Lấy danh sách Sinh viên từ bảng Enrollment
        List<Enrollment> enrollments = enrollmentRepository.findByCourseClassId(classId);
        List<Map<String, Object>> studentsData = new ArrayList<>();

        for (Enrollment e : enrollments) {
            User user = e.getStudent().getUser();
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("studentId", user.getId());
            sMap.put("studentCode", user.getStudentCode() != null ? user.getStudentCode() : "Chưa có MSSV");
            sMap.put("fullName", user.getFullName());

            Double processScore = null;
            Double finalScore = null;

            List<GradeScore> scores = gradeScoreRepository.findByEnrollmentId(e.getId());
            for (GradeScore gs : scores) {
                if (gs.getComponent().getName().toUpperCase().contains("QUÁ TRÌNH")) {
                    processScore = gs.getScore();
                } else if (gs.getComponent().getName().toUpperCase().contains("THI")) {
                    finalScore = gs.getScore();
                }
            }

            sMap.put("processScore", processScore);
            sMap.put("finalScore", finalScore);
            studentsData.add(sMap);
        }
        
        return ResponseEntity.ok(studentsData);
    }

    @PostMapping("/classes/{classId}/students/{studentId}/grades")
    public ResponseEntity<?> saveGrades(@PathVariable UUID classId, @PathVariable UUID studentId, @RequestBody Map<String, Double> payload) {
        Classroom classroom = classroomRepository.findById(classId).orElseThrow();
        
        // Kiểm tra Sinh viên có đăng ký lớp này thật không
        Enrollment enrollment = enrollmentRepository.findByStudent_User_Id(studentId).stream()
                .filter(e -> e.getCourseClass().getId().equals(classroom.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sinh viên không thuộc lớp này (Chưa đăng ký)"));

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