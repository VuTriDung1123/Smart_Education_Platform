package com.sep.core_service.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    // 🔥 API LẤY BẢNG ĐIỂM CỰC ĐẸP 🔥
    @GetMapping("/transcript/{studentId}")
    public Map<String, Object> getStudentTranscript(@PathVariable UUID studentId) {
        // 1. Tìm sinh viên
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sinh viên!"));

        // 2. Lấy toàn bộ điểm của sinh viên này
        java.util.List<StudentSubjectGrade> grades = gradeRepository.findByStudentId(studentId);

        // 3. Chuẩn bị các biến để tính Tổng kết
        int totalCredits = 0;
        double totalScore4 = 0;
        double totalScore10 = 0;

        // 4. Định dạng lại danh sách điểm cho đẹp (Không bị đệ quy vòng lặp JSON)
        java.util.List<Map<String, Object>> chiTietDiem = new java.util.ArrayList<>();

        for (StudentSubjectGrade g : grades) {
            Map<String, Object> monHoc = new HashMap<>();
            monHoc.put("hoc_ky", g.getSemester());
            monHoc.put("ma_mon", g.getSubject().getSubjectCode());
            monHoc.put("ten_mon", g.getSubject().getName());
            monHoc.put("tin_chi", g.getCreditsAtTime());
            monHoc.put("diem_he_10", g.getScore10());
            monHoc.put("diem_he_4", g.getScore4());
            monHoc.put("diem_chu", g.getGradeLetter());
            chiTietDiem.add(monHoc);

            // Cộng dồn để tính GPA
            int tc = g.getCreditsAtTime();
            totalCredits += tc;
            totalScore4 += (g.getScore4() * tc);
            totalScore10 += (g.getScore10() * tc);
        }

        // Tính GPA trung bình (Nếu chưa học môn nào thì cho bằng 0)
        double gpa4 = totalCredits > 0 ? (totalScore4 / totalCredits) : 0.0;
        double gpa10 = totalCredits > 0 ? (totalScore10 / totalCredits) : 0.0;

        // 5. Đóng gói thành phẩm JSON chuẩn "Cổng thông tin Đào tạo"
        Map<String, Object> transcript = new HashMap<>();
        
        // Thông tin sinh viên
        Map<String, String> thongTinSv = new HashMap<>();
        thongTinSv.put("ma_sinh_vien", student.getStudentCode());
        thongTinSv.put("ho_ten", student.getUser().getFullName());
        thongTinSv.put("trang_thai", student.getAcademicStatus());
        transcript.put("thong_tin_sinh_vien", thongTinSv);

        // Danh sách môn
        transcript.put("bang_diem_chi_tiet", chiTietDiem);

        // Tổng kết GPA
        Map<String, Object> tongKet = new HashMap<>();
        tongKet.put("tong_tin_chi_tich_luy", totalCredits);
        // Làm tròn 2 chữ số thập phân cho GPA
        tongKet.put("gpa_he_10", Math.round(gpa10 * 100.0) / 100.0);
        tongKet.put("gpa_he_4", Math.round(gpa4 * 100.0) / 100.0);
        transcript.put("tong_ket", tongKet);

        return transcript;
    }
}