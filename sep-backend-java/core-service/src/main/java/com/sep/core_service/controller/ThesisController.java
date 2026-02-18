package com.sep.core_service.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.ThesisRegistration;
import com.sep.core_service.entity.ThesisSubmission;
import com.sep.core_service.entity.ThesisTopic;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.ThesisRegistrationRepository;
import com.sep.core_service.repository.ThesisSubmissionRepository;
import com.sep.core_service.repository.ThesisTopicRepository;

@RestController
@RequestMapping("/api/thesis")
public class ThesisController {

    @Autowired private ThesisTopicRepository topicRepository;
    @Autowired private ThesisRegistrationRepository registrationRepository;
    @Autowired private ThesisSubmissionRepository submissionRepository;
    @Autowired private StudentRepository studentRepository;

    // 🔥 API 1: TẠO ĐỀ TÀI ĐỒ ÁN
    @PostMapping("/topics/create")
    public ThesisTopic createTopic(@RequestParam String title) {
        ThesisTopic topic = new ThesisTopic();
        topic.setTitle(title); // Ví dụ: "Xây dựng hệ thống Smart Education"
        return topicRepository.save(topic);
    }

    // 🔥 API 2: SINH VIÊN ĐĂNG KÝ ĐỀ TÀI
    @PostMapping("/register")
    public ThesisRegistration registerTopic(
            @RequestParam UUID topicId, 
            @RequestParam UUID studentId) {
        
        ThesisTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài!"));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

        ThesisRegistration reg = new ThesisRegistration();
        reg.setTopic(topic);
        reg.setStudent(student);
        reg.setStatus("PENDING"); // Đang chờ duyệt

        return registrationRepository.save(reg);
    }

    // 🔥 API 3: NỘP BÀI (Hứng link file từ Cloudinary)
    @PostMapping("/submit")
    public ThesisSubmission submitThesis(
            @RequestParam UUID topicId,
            @RequestParam UUID studentId,
            @RequestParam String fileUrl) { 

        ThesisTopic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài!"));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

        ThesisSubmission submission = new ThesisSubmission();
        submission.setTopic(topic);
        submission.setStudent(student);
        submission.setFileUrl(fileUrl); // Lưu lại đường dẫn tới file báo cáo PDF/Word
        submission.setScore(0.0); // Khởi tạo điểm là 0 (chờ giảng viên chấm)

        return submissionRepository.save(submission);
    }
}