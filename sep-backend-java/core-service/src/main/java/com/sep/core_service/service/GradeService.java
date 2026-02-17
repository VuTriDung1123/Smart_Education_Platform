package com.sep.core_service.service;

import org.springframework.stereotype.Service;

@Service
public class GradeService {

    // Quy đổi từ hệ 10 sang hệ 4 theo ảnh Dũng gửi
    public double convertToGrade4(double score10) {
        if (score10 >= 8.5) return 4.0;
        if (score10 >= 8.0) return 3.5;
        if (score10 >= 7.0) return 3.0;
        if (score10 >= 6.0) return 2.5;
        if (score10 >= 5.5) return 2.0;
        if (score10 >= 5.0) return 1.5;
        if (score10 >= 4.0) return 1.0;
        if (score10 >= 2.1) return 0.5;
        return 0.0;
    }

    // Lấy điểm chữ (A, B+, B...)
    public String convertToGradeLetter(double score10) {
        if (score10 >= 8.5) return "A";
        if (score10 >= 8.0) return "B+";
        if (score10 >= 7.0) return "B";
        if (score10 >= 6.0) return "C+";
        if (score10 >= 5.5) return "C";
        if (score10 >= 5.0) return "D+";
        if (score10 >= 4.0) return "D";
        if (score10 >= 2.1) return "F+";
        return "F";
    }
}