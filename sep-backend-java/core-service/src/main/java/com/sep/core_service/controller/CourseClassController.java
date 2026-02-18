package com.sep.core_service.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.CourseClass;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.Subject;
import com.sep.core_service.repository.CourseClassRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.SubjectRepository;

@RestController
@RequestMapping("/api/classes")
public class CourseClassController {

    @Autowired private CourseClassRepository classRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private StudentRepository studentRepository;
    

    // 🔥 API 1: PHÒNG ĐÀO TẠO MỞ LỚP HỌC MỚI
    @PostMapping("/create")
    public CourseClass createClass(
            @RequestParam UUID subjectId,
            @RequestParam String semester,
            @RequestParam String academicYear) {
        
        // Tìm môn học xem có tồn tại không
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy môn học!"));
        
        CourseClass courseClass = new CourseClass();
        courseClass.setSubject(subject);
        courseClass.setSemester(semester);
        courseClass.setAcademicYear(academicYear);
        courseClass.setStatus("OPEN"); // Lớp đang mở đăng ký
        
        return classRepository.save(courseClass);
    }

    // 🔥 API 2: SINH VIÊN ĐĂNG KÝ VÀO LỚP
    @PostMapping("/{classId}/enroll")
    public Enrollment enrollToClass(
            @PathVariable UUID classId,
            @RequestParam UUID studentId) {
        
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại!"));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại!"));
        
        Enrollment enrollment = new Enrollment();
        enrollment.setCourseClass(courseClass);
        enrollment.setStudent(student);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus("ENROLLED");
        
        return enrollmentRepository.save(enrollment);
    }

    // 🔥 API 3: XUẤT DANH SÁCH LỚP (DÀNH CHO GIẢNG VIÊN ĐIỂM DANH)
    @GetMapping("/{classId}/students")
    public Map<String, Object> getClassRoster(@PathVariable UUID classId) {
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại!"));
        
        List<Enrollment> enrollments = enrollmentRepository.findByCourseClassId(classId);
        
        // Làm đẹp dữ liệu JSON trả về
        List<Map<String, String>> studentList = new ArrayList<>();
        for (Enrollment e : enrollments) {
            Map<String, String> s = new HashMap<>();
            s.put("ma_sv", e.getStudent().getStudentCode());
            s.put("ho_ten", e.getStudent().getUser().getFullName());
            s.put("ngay_dang_ky", e.getEnrollmentDate().toString());
            s.put("trang_thai", e.getStatus());
            studentList.add(s);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("mon_hoc", courseClass.getSubject().getName());
        response.put("hoc_ky", courseClass.getSemester());
        response.put("nam_hoc", courseClass.getAcademicYear());
        response.put("si_so", studentList.size());
        response.put("danh_sach_sinh_vien", studentList);
        
        return response;
    }
    
}