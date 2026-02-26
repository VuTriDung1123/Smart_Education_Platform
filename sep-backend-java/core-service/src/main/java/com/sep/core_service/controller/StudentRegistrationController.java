package com.sep.core_service.controller;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sep.core_service.entity.*;
import com.sep.core_service.repository.*;

@RestController
@RequestMapping("/api/students/registration")
public class StudentRegistrationController {

    @Autowired private CourseClassRepository courseClassRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;

    private Student getCurrentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
        return studentRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sinh viên"));
    }

    // ==========================================
    // 1. LẤY DANH SÁCH LỚP MỞ ĐỂ ĐĂNG KÝ (DB THẬT)
    // ==========================================
    @GetMapping("/available-classes")
    public ResponseEntity<?> getAvailableClasses() {
        // Lấy tất cả các lớp đang mở trạng thái "OPEN" từ DB
        List<CourseClass> openClasses = courseClassRepository.findAll().stream()
                .filter(c -> "OPEN".equals(c.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> result = openClasses.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId().toString());
            map.put("code", c.getSubject().getSubjectCode());
            map.put("name", c.getSubject().getName());
            map.put("credits", c.getSubject().getCredits());
            
            // Format chuỗi Lịch học để hiển thị
            String thu = c.getDayOfWeek() != null ? c.getDayOfWeek().toString() : "Chưa xếp";
            if("8".equals(thu)) thu = "Chủ nhật";
            String tiet = c.getTiet() != null ? c.getTiet() : "Chưa xếp";
            map.put("schedule", "Thứ " + thu + " (Tiết " + tiet + ")");
            
            // Xử lý điều kiện tiên quyết
            String prereq = "Không";
            if(c.getSubject().getPrerequisiteSubjects() != null && !c.getSubject().getPrerequisiteSubjects().isEmpty()) {
                prereq = c.getSubject().getPrerequisiteSubjects().stream()
                            .map(Subject::getSubjectCode).collect(Collectors.joining(", "));
            }
            map.put("prerequisite", prereq);

            // Đếm sĩ số thực tế từ bảng Enrollments
            int enrolledCount = enrollmentRepository.findByCourseClassId(c.getId()).size();
            int maxStudents = 40; // Quy định 1 lớp tối đa 40 SV
            int remaining = maxStudents - enrolledCount;
            
            map.put("status", remaining > 0 ? "OPEN" : "FULL");
            map.put("remaining", Math.max(remaining, 0));
            
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ==========================================
    // 2. ĐĂNG KÝ MÔN HỌC (LƯU DB THẬT)
    // ==========================================
    @PostMapping("/enroll/{classId}")
    public ResponseEntity<?> enrollClass(@PathVariable UUID classId) {
        Student student = getCurrentStudent();
        CourseClass courseClass = courseClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại!"));

        // Kiểm tra xem đã đăng ký lớp này chưa
        boolean alreadyEnrolled = enrollmentRepository.findByStudent_User_Id(student.getId()).stream()
                .anyMatch(e -> e.getCourseClass().getId().equals(classId));
        if (alreadyEnrolled) {
            return ResponseEntity.badRequest().body("Bạn đã đăng ký lớp học này rồi!");
        }

        // Kiểm tra sĩ số
        int enrolledCount = enrollmentRepository.findByCourseClassId(classId).size();
        if (enrolledCount >= 40) {
            return ResponseEntity.badRequest().body("Lớp học đã đầy sĩ số! Bạn có muốn vào Waitlist không?");
        }

        // Lưu vào DB
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourseClass(courseClass);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus("ENROLLED");
        
        enrollmentRepository.save(enrollment);

        return ResponseEntity.ok("✅ Đăng ký thành công! Hệ thống đã thêm môn học vào Thời khóa biểu.");
    }

    // ==========================================
    // 3. AI RECOMMENDATION (Giữ nguyên cho Giai đoạn 3 xử lý sau)
    // ==========================================
    @GetMapping("/ai-recommendations")
    public ResponseEntity<?> getAiRecommendations() {
        List<Map<String, Object>> recommendations = Arrays.asList(
            Map.of("code", "IT001", "name", "Cấu trúc dữ liệu & Giải thuật", "match", 98, "reason", "Bạn đã đạt điểm A môn Lập trình cơ bản. Môn này là bắt buộc tiếp theo trong lộ trình.", "type", "BẮT BUỘC"),
            Map.of("code", "IT002", "name", "Trí tuệ nhân tạo (AI)", "match", 85, "reason", "Phù hợp với định hướng chuyên ngành 'Khoa học Dữ liệu' của bạn. Xu hướng ngành đang rất hot.", "type", "GỢI Ý MỞ RỘNG")
        );
        return ResponseEntity.ok(recommendations);
    }
}