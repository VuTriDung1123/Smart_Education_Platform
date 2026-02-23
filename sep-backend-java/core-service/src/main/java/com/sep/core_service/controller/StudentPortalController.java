package com.sep.core_service.controller;

import com.sep.core_service.entity.*;
import com.sep.core_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student-portal")
public class StudentPortalController {

    @Autowired private UserRepository userRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private GradeScoreRepository gradeScoreRepository;
    @Autowired private StudentRepository studentRepository;

    @GetMapping("/me/{userId}")
    public ResponseEntity<?> getMyPortalData(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));

        Map<String, Object> response = new HashMap<>();

        // 1. DỮ LIỆU PROFILE (Lấy từ bảng User như bạn đã thêm)
        Map<String, Object> profile = new HashMap<>();
        profile.put("fullName", user.getFullName());
        profile.put("studentCode", user.getStudentCode() != null ? user.getStudentCode() : "Chưa cập nhật");
        profile.put("gender", user.getGender() != null ? user.getGender() : "Nam");
        profile.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth() : "01/01/2000");
        profile.put("placeOfBirth", user.getPlaceOfBirth() != null ? user.getPlaceOfBirth() : "Chưa cập nhật");
        profile.put("major", user.getMajor() != null ? user.getMajor() : "Công nghệ thông tin");
        profile.put("batch", user.getBatch() != null ? user.getBatch() : "2023");
        response.put("profile", profile);

        // 2. DỮ LIỆU BẢNG ĐIỂM (Tính toán từ Enrollment, GradeScore, GradeComponent)
        List<Enrollment> enrollments = enrollmentRepository.findByStudent_User_Id(userId);
        
        List<Map<String, Object>> gradesData = new ArrayList<>();
        
        for (Enrollment enrollment : enrollments) {
            CourseClass courseClass = enrollment.getCourseClass();
            Subject subject = courseClass.getSubject();
            
            Map<String, Object> gradeEntry = new HashMap<>();
            gradeEntry.put("subjectCode", subject.getSubjectCode());
            gradeEntry.put("subjectName", subject.getName());
            gradeEntry.put("credits", subject.getCredits());
            gradeEntry.put("semester", courseClass.getSemester() + " " + courseClass.getAcademicYear());
            
            // Lấy tất cả điểm của Enrollment này
            List<GradeScore> scores = gradeScoreRepository.findByEnrollmentId(enrollment.getId());
            
            double totalScore = 0.0;
            Double processScore = null; // Điểm quá trình
            Double finalExamScore = null; // Điểm thi
            
            for (GradeScore gs : scores) {
                GradeComponent component = gs.getComponent();
                totalScore += (gs.getScore() * component.getWeight());
                
                // Phân loại điểm để hiển thị lên bảng cho đẹp
                if (component.getName().toUpperCase().contains("QUÁ TRÌNH") || component.getName().toUpperCase().contains("CHUYÊN CẦN")) {
                    processScore = gs.getScore();
                } else if (component.getName().toUpperCase().contains("THI") || component.getName().toUpperCase().contains("CUỐI KỲ")) {
                    finalExamScore = gs.getScore();
                }
            }

            // Làm tròn 1 chữ số thập phân
            totalScore = Math.round(totalScore * 10.0) / 10.0;
            
            gradeEntry.put("processScore", processScore);
            gradeEntry.put("finalScore", finalExamScore);
            gradeEntry.put("totalScore", scores.isEmpty() ? null : totalScore);
            gradeEntry.put("letterGrade", scores.isEmpty() ? null : convertToLetterGrade(totalScore));
            gradeEntry.put("status", totalScore >= 4.0 ? "Đạt" : "Học lại");
            
            gradesData.add(gradeEntry);
        }

        response.put("grades", gradesData);
        
        return ResponseEntity.ok(response);
    }

    // Hàm chuyển đổi điểm hệ 10 sang hệ chữ (Chuẩn tín chỉ)
    private String convertToLetterGrade(double score) {
        if (score >= 8.5) return "A";
        if (score >= 8.0) return "B+";
        if (score >= 7.0) return "B";
        if (score >= 6.5) return "C+";
        if (score >= 5.5) return "C";
        if (score >= 5.0) return "D+";
        if (score >= 4.0) return "D";
        return "F";
    }


    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateStudentProfile(@PathVariable UUID userId, @RequestBody Map<String, String> payload) {
        // 1. Lưu thông tin vào bảng Users
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));

        String newStudentCode = payload.get("studentCode");

        user.setStudentCode(newStudentCode);
        user.setGender(payload.get("gender"));
        user.setDateOfBirth(payload.get("dateOfBirth"));
        user.setPlaceOfBirth(payload.get("placeOfBirth"));
        user.setMajor(payload.get("major"));
        user.setBatch(payload.get("batch"));
        userRepository.save(user);

        // 2. Lưu đồng bộ sang bảng Students (Bắt buộc vì DB của bạn thiết kế 1-1)
        Optional<Student> studentOpt = studentRepository.findById(userId);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            student.setStudentCode(newStudentCode); // Cập nhật MSSV mới
            studentRepository.save(student);
        } else {
            // Nếu sinh viên này chưa từng có trong bảng Students thì tạo mới luôn
            Student newStudent = new Student();
            newStudent.setUser(user);
            newStudent.setStudentCode(newStudentCode);
            newStudent.setEnrollmentYear(Integer.parseInt(payload.get("batch")));
            studentRepository.save(newStudent);
        }
        
        return ResponseEntity.ok("Cập nhật hồ sơ thành công!");
    }
}