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
import org.springframework.web.multipart.MultipartFile;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.util.Map;
@RestController
@RequestMapping("/api/thesis")
public class ThesisController {

    @Autowired private ThesisTopicRepository topicRepository;
    @Autowired private ThesisRegistrationRepository registrationRepository;
    @Autowired private ThesisSubmissionRepository submissionRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private Cloudinary cloudinary;
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

    // 🔥 API 3 (NÂNG CẤP): NỘP BÀI CÓ UPLOAD FILE THẬT
    @PostMapping(value = "/submit", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ThesisSubmission submitThesis(
            @RequestParam UUID topicId,
            @RequestParam UUID studentId,
            @RequestParam("file") MultipartFile file) { // <-- Thay đổi ở đây

        try {
            // 1. Kiểm tra tồn tại
            ThesisTopic topic = topicRepository.findById(topicId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài!"));
            
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên!"));

            // 2. Upload file lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",       // Tự nhận diện file PDF, Docx, Ảnh...
                    "folder", "sep_thesis_submissions" // Tên thư mục trên Cloud
            ));
            
            String fileUrl = (String) uploadResult.get("secure_url"); // Lấy link về

            // 3. Lưu link vào Database
            ThesisSubmission submission = new ThesisSubmission();
            submission.setTopic(topic);
            submission.setStudent(student);
            submission.setFileUrl(fileUrl);
            submission.setScore(0.0);

            return submissionRepository.save(submission);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi upload file: " + e.getMessage());
        }
    }
}