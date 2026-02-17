package com.sep.core_service.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.service.GradeService;

@RestController
@RequestMapping("/api/test-grade")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    // URL: http://localhost:8080/api/test-grade/quick-test?cc=9.0&hk=7.0&wcc=0.3
    @GetMapping("/quick-test")
    public Map<String, Object> testGrade(
            @RequestParam double cc,  // Điểm chuyên cần
            @RequestParam double hk,  // Điểm học kỳ
            @RequestParam double wcc  // Trọng số chuyên cần (ví dụ 0.3)
    ) {
        double whk = 1.0 - wcc; // Tự tính trọng số học kỳ (ví dụ 0.7)
        double finalScore10 = (cc * wcc) + (hk * whk);
        
        double score4 = gradeService.convertToGrade4(finalScore10);
        String letter = gradeService.convertToGradeLetter(finalScore10);

        Map<String, Object> result = new HashMap<>();
        result.put("mon_hoc", "Môn học Test (Ví dụ: Chính trị)");
        result.put("diem_chuyen_can", cc + " (Tỷ lệ: " + (wcc * 100) + "%)");
        result.put("diem_hoc_ky", hk + " (Tỷ lệ: " + (whk * 100) + "%)");
        result.put("tong_ket_he_10", Math.round(finalScore10 * 100.0) / 100.0);
        result.put("quy_doi_he_4", score4);
        result.put("diem_chu", letter);
        result.put("xep_loai", getRank(score4));

        return result;
    }

    private String getRank(double gpa) {
        if (gpa >= 3.6) return "Xuất sắc";
        if (gpa >= 3.2) return "Giỏi";
        if (gpa >= 2.5) return "Khá";
        if (gpa >= 2.0) return "Trung bình";
        return "Yếu/Kém";
    }
}