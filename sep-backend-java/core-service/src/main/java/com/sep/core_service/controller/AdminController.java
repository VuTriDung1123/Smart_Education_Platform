package com.sep.core_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Semester;
import com.sep.core_service.repository.SemesterRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private SemesterRepository semesterRepository;

    // 1. Lấy toàn bộ danh sách Học kỳ
    @GetMapping("/semesters")
    public ResponseEntity<List<Semester>> getAllSemesters() {
        return ResponseEntity.ok(semesterRepository.findAll());
    }

    // 2. Tạo Học kỳ mới
    @PostMapping("/semesters")
    public ResponseEntity<?> createSemester(@RequestBody Semester semester) {
        // Mặc định khi tạo mới thì không mở đăng ký và không active vội
        semester.setIsActive(false);
        semester.setIsRegistrationOpen(false);
        return ResponseEntity.ok(semesterRepository.save(semester));
    }

    // 3. Đóng/Mở hệ thống
    @PutMapping("/semesters/{id}/toggle")
    public ResponseEntity<?> toggleSemesterStatus(@PathVariable UUID id, @RequestParam String type) {
        Semester sem = semesterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Học kỳ"));
        
        if ("active".equals(type)) {
            // Đảm bảo tại 1 thời điểm chỉ có 1 học kỳ Active (Đang diễn ra)
            if (!sem.getIsActive()) {
                semesterRepository.findAll().forEach(s -> {
                    s.setIsActive(false);
                    semesterRepository.save(s);
                });
            }
            sem.setIsActive(true);
        } else if ("registration".equals(type)) {
            // Đóng/Mở cổng đăng ký tín chỉ
            sem.setIsRegistrationOpen(!sem.getIsRegistrationOpen());
        }
        
        return ResponseEntity.ok(semesterRepository.save(sem));
    }
}