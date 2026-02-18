package com.sep.core_service.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.AttendanceRecord;
import com.sep.core_service.entity.AttendanceSession;
import com.sep.core_service.entity.CourseClass;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.AttendanceRecordRepository;
import com.sep.core_service.repository.AttendanceSessionRepository;
import com.sep.core_service.repository.CourseClassRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseClassRepository classRepository;
    @Autowired private AttendanceSessionRepository sessionRepository;
    @Autowired private AttendanceRecordRepository recordRepository;
    @Autowired private StudentRepository studentRepository;

    // 🔥 API 1: ĐĂNG KÝ KHUÔN MẶT VÀO HỆ THỐNG (Giả lập lưu Vector JSON)
    @PostMapping("/register-face/{userId}")
    public Map<String, String> registerFace(@PathVariable UUID userId, @RequestBody String faceVectorJson) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));
        
        // Lưu chuỗi JSON chứa các điểm ảnh khuôn mặt (Face Vector) vào DB
        user.setFaceVector(faceVectorJson);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã cập nhật dữ liệu khuôn mặt cho " + user.getFullName() + " thành công!");
        return response;
    }

    // 🔥 API 2: GIẢNG VIÊN TẠO BUỔI ĐIỂM DANH CHO LỚP
    @PostMapping("/sessions/create")
    public AttendanceSession createSession(@RequestParam UUID classId, @RequestParam boolean requireFace) {
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học!"));

        AttendanceSession session = new AttendanceSession();
        session.setCourseClass(courseClass);
        session.setSessionDate(LocalDate.now()); // Điểm danh ngày hôm nay
        session.setIsFaceRequired(requireFace); // Có bắt buộc dùng AI không?

        return sessionRepository.save(session);
    }

    // 🔥 API 3: CAMERA AI BÁO CÁO ĐIỂM DANH SINH VIÊN
    @PostMapping("/check-in")
    public AttendanceRecord checkIn(
            @RequestParam UUID sessionId, 
            @RequestParam UUID studentId) {
        
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Ca điểm danh không hợp lệ!"));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại!"));

        // Giả lập Logic: Kiểm tra xem Sinh viên đã đăng ký khuôn mặt chưa?
        boolean isVerified = false;
        if (session.getIsFaceRequired()) {
            if (student.getUser().getFaceVector() != null) {
                isVerified = true; // AI báo khớp khuôn mặt
            } else {
                throw new RuntimeException("Sinh viên này chưa đăng ký dữ liệu khuôn mặt trong hệ thống!");
            }
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setSession(session);
        record.setStudent(student);
        record.setFaceVerified(isVerified);
        record.setStatus(isVerified ? "PRESENT" : "ABSENT"); // Khớp mặt thì HIỆN DIỆN, không thì VẮNG

        return recordRepository.save(record);
    }
}