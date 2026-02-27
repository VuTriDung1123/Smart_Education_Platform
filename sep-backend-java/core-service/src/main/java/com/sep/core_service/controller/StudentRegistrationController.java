package com.sep.core_service.controller;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.Subject;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.StudentSubjectGradeRepository;
import com.sep.core_service.repository.SubjectRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/students/registration")
public class StudentRegistrationController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private StudentSubjectGradeRepository gradeRepository;

    private Student getCurrentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
        
        // Tự động khởi tạo hồ sơ Student nếu trong DB chưa có
        return studentRepository.findById(user.getId()).orElseGet(() -> {
            Student newStudent = new Student();
            newStudent.setUser(user);
            newStudent.setStudentCode(user.getStudentCode() != null ? user.getStudentCode() : "SV_CHUA_CAP_NHAT");
            newStudent.setEnrollmentYear(2023); // Khóa mặc định
            newStudent.setAcademicStatus("STUDYING");
            return studentRepository.save(newStudent);
        });
    }

    @GetMapping("/available-classes")
    public ResponseEntity<?> getAvailableClasses() {
        List<Classroom> openClasses = classroomRepository.findAll().stream()
                .filter(c -> "OPEN".equals(c.getStatus())).collect(Collectors.toList());

        List<Map<String, Object>> result = openClasses.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId().toString());
            map.put("code", c.getSubject().getSubjectCode());
            map.put("name", c.getSubject().getName());
            map.put("credits", c.getSubject().getCredits());
            
            String thu = c.getDayOfWeek() != null ? c.getDayOfWeek().toString() : "Chưa xếp";
            if("8".equals(thu)) thu = "Chủ nhật";
            map.put("schedule", "Thứ " + thu + " (Tiết " + (c.getTiet() != null ? c.getTiet() : "Chưa xếp") + ")");
            
            String prereq = "Không";
            if(c.getSubject().getPrerequisiteSubjects() != null && !c.getSubject().getPrerequisiteSubjects().isEmpty()) {
                prereq = c.getSubject().getPrerequisiteSubjects().stream().map(Subject::getSubjectCode).collect(Collectors.joining(", "));
            }
            map.put("prerequisite", prereq);

            int enrolledCount = enrollmentRepository.findByCourseClassId(c.getId()).size();
            int maxStudents = 40; 
            map.put("status", (maxStudents - enrolledCount) > 0 ? "OPEN" : "FULL");
            map.put("remaining", Math.max(maxStudents - enrolledCount, 0));
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/enroll/{classId}")
    public ResponseEntity<?> enrollClass(@PathVariable UUID classId) {
        Student student = getCurrentStudent();
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại!"));

        if (enrollmentRepository.findByStudent_User_Id(student.getId()).stream().anyMatch(e -> e.getCourseClass().getId().equals(classId))) {
            return ResponseEntity.badRequest().body("Bạn đã đăng ký lớp học này rồi!");
        }
        if (enrollmentRepository.findByCourseClassId(classId).size() >= 40) {
            return ResponseEntity.badRequest().body("Lớp học đã đầy sĩ số!");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourseClass(classroom);
        
        enrollment.setStatus("ENROLLED");
        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok("✅ Đăng ký thành công!");
    }

    @GetMapping("/ai-recommendations")
    public ResponseEntity<?> getAiRecommendations() {
        Student student = getCurrentStudent();
        Set<UUID> passedIds = gradeRepository.findByStudentId(student.getId()).stream()
                .filter(g -> g.getScore10() != null && g.getScore10() >= 4.0).map(g -> g.getSubject().getId()).collect(Collectors.toSet());
        Set<UUID> studyingIds = enrollmentRepository.findByStudent_User_Id(student.getId()).stream()
                .filter(e -> "ENROLLED".equals(e.getStatus())).map(e -> e.getCourseClass().getSubject().getId()).collect(Collectors.toSet());

        List<Map<String, Object>> recommendations = new ArrayList<>();
        for (Subject sub : subjectRepository.findAll()) {
            if (passedIds.contains(sub.getId()) || studyingIds.contains(sub.getId())) continue;
            boolean eligible = true;
            if (sub.getPrerequisiteSubjects() != null) {
                for (Subject prereq : sub.getPrerequisiteSubjects()) if (!passedIds.contains(prereq.getId())) { eligible = false; break; }
            }
            if (eligible) {
                Map<String, Object> rec = new HashMap<>();
                rec.put("code", sub.getSubjectCode()); rec.put("name", sub.getName());
                int match = sub.getIsElective() ? 75 : 95;
                String reason = sub.getIsElective() ? "Môn tự chọn phù hợp chuyên ngành." : "Lộ trình bắt buộc tiếp theo.";
                if (sub.getPrerequisiteSubjects() != null && !sub.getPrerequisiteSubjects().isEmpty()) { match += 4; reason = "Bạn vừa hoàn thành môn tiên quyết, học ngay kẻo quên kiến thức."; }
                rec.put("match", match); rec.put("type", sub.getIsElective() ? "TỰ CHỌN" : "BẮT BUỘC"); rec.put("reason", reason);
                recommendations.add(rec);
            }
            if (recommendations.size() >= 4) break;
        }
        recommendations.sort((a, b) -> Integer.compare((Integer)b.get("match"), (Integer)a.get("match")));
        return ResponseEntity.ok(recommendations);
    }
}