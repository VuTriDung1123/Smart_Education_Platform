package com.sep.core_service.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    // API cấp thẻ sinh viên từ một User ID đã có
    @PostMapping("/enroll/{userId}")
    public Student enrollStudent(
            @PathVariable UUID userId,
            @RequestParam String studentCode,
            @RequestParam int year
    ) {
        // 1. Tìm User trong Database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản User này!"));

        // 2. Tạo hồ sơ Sinh viên mới và gắn User vào
        Student student = new Student();
        student.setUser(user); // Nối 1-1 cực kỳ quan trọng
        student.setStudentCode(studentCode);
        student.setEnrollmentYear(year);
        student.setAcademicStatus("STUDYING");

        // 3. Lưu xuống Database
        return studentRepository.save(student);
    }
}