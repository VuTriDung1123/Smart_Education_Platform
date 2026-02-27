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
import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.AttendanceRecordRepository;
import com.sep.core_service.repository.AttendanceSessionRepository;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired private UserRepository userRepository;
    @Autowired private ClassroomRepository classRepository; // Đã sửa thành ClassroomRepository
    @Autowired private AttendanceSessionRepository sessionRepository;
    @Autowired private AttendanceRecordRepository recordRepository;
    @Autowired private StudentRepository studentRepository;

    @PostMapping("/register-face/{userId}")
    public Map<String, String> registerFace(@PathVariable UUID userId, @RequestBody String faceVectorJson) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User!"));
        user.setFaceVector(faceVectorJson);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã cập nhật dữ liệu khuôn mặt cho " + user.getFullName() + " thành công!");
        return response;
    }

    @PostMapping("/sessions/create")
    public AttendanceSession createSession(@RequestParam UUID classId, @RequestParam boolean requireFace) {
        Classroom classroom = classRepository.findById(classId) // Đã sửa
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học!"));

        AttendanceSession session = new AttendanceSession();
        session.setCourseClass(classroom); // Đã sửa
        session.setSessionDate(LocalDate.now()); 
        session.setIsFaceRequired(requireFace); 

        return sessionRepository.save(session);
    }

    @PostMapping("/check-in")
    public AttendanceRecord checkIn(
            @RequestParam UUID sessionId, 
            @RequestParam UUID studentId) {
        
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Ca điểm danh không hợp lệ!"));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại!"));

        boolean isVerified = false;
        if (session.getIsFaceRequired()) {
            if (student.getUser().getFaceVector() != null) {
                isVerified = true; 
            } else {
                throw new RuntimeException("Sinh viên này chưa đăng ký dữ liệu khuôn mặt trong hệ thống!");
            }
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setSession(session);
        record.setStudent(student);
        record.setFaceVerified(isVerified);
        record.setStatus(isVerified ? "PRESENT" : "ABSENT");

        return recordRepository.save(record);
    }
}