package com.sep.core_service.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.StudentSubjectGrade;
import com.sep.core_service.entity.Subject;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.StudentSubjectGradeRepository;
import com.sep.core_service.repository.SubjectRepository;
import com.sep.core_service.service.GradeService;

@RestController
@RequestMapping("/api/grades")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private StudentSubjectGradeRepository gradeRepository;

    // API cũ: Test nháp trên trình duyệt (giữ lại để dùng nếu cần)
    @GetMapping("/quick-test")
    public Map<String, Object> testGrade(
            @RequestParam double cc, @RequestParam double hk, @RequestParam double wcc
    ) {
        double whk = 1.0 - wcc;
        double finalScore10 = (cc * wcc) + (hk * whk);
        double score4 = gradeService.convertToGrade4(finalScore10);
        
        Map<String, Object> result = new HashMap<>();
        result.put("tong_ket_he_10", finalScore10);
        result.put("quy_doi_he_4", score4);
        result.put("diem_chu", gradeService.convertToGradeLetter(finalScore10));
        return result;
    }

    // 🔥 API MỚI: LƯU ĐIỂM THẬT VÀO DATABASE 🔥
    @PostMapping("/save-final")
    public StudentSubjectGrade saveFinalGrade(
            @RequestParam UUID studentId,
            @RequestParam UUID subjectId,
            @RequestParam double score10,
            @RequestParam String semester
    ) {
        // 1. Tìm Sinh viên và Môn học xem có tồn tại không
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sinh viên!"));
        
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Môn học!"));

        // 2. Tạo Bảng điểm mới
        StudentSubjectGrade grade = new StudentSubjectGrade();
        grade.setStudent(student);
        grade.setSubject(subject);
        grade.setSemester(semester);
        grade.setCreditsAtTime(subject.getCredits()); // Lưu lại số tín chỉ
        grade.setScore10(score10);
        
        // 3. Gọi "Bếp trưởng" GradeService ra quy đổi điểm tự động
        grade.setScore4(gradeService.convertToGrade4(score10));
        grade.setGradeLetter(gradeService.convertToGradeLetter(score10));

        // 4. Lưu vào Database
        return gradeRepository.save(grade);
    }
}