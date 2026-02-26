package com.sep.core_service.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Department;
import com.sep.core_service.entity.ThesisTopic;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.DepartmentRepository;
import com.sep.core_service.repository.ThesisTopicRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/academic")
public class AdminAcademicController {

    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private ThesisTopicRepository thesisTopicRepository;
    @Autowired private UserRepository userRepository;

    // ==========================================
    // MODULE 1: QUẢN LÝ KHOA (DEPARTMENTS)
    // ==========================================
    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        if (departmentRepository.findAll().stream().anyMatch(d -> d.getName().equalsIgnoreCase(name))) {
            return ResponseEntity.badRequest().body("Tên khoa đã tồn tại!");
        }
        Department dept = new Department();
        dept.setName(name);
        dept.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(departmentRepository.save(dept));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable UUID id) {
        departmentRepository.deleteById(id);
        return ResponseEntity.ok("Xóa khoa thành công!");
    }

    // ==========================================
    // MODULE 2: QUẢN LÝ ĐỒ ÁN / KHÓA LUẬN (THESIS)
    // ==========================================
    @GetMapping("/theses")
    public ResponseEntity<?> getAllTheses() {
        List<Map<String, Object>> result = thesisTopicRepository.findAll().stream().map(topic -> {
            String supervisorName = "Chưa phân công";
            if (topic.getSupervisor() != null) {
                User gv = userRepository.findById(topic.getSupervisor().getId()).orElse(null);
                if (gv != null) supervisorName = gv.getFullName();
            }
            
            // Dùng HashMap thay vì Map.of để tránh lỗi Type Mismatch của Java
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", topic.getId());
            map.put("title", topic.getTitle());
            map.put("supervisorName", supervisorName);
            return map;
            
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/theses")
    public ResponseEntity<?> createThesis(@RequestBody Map<String, String> payload) {
        ThesisTopic topic = new ThesisTopic();
        topic.setTitle(payload.get("title"));
        // Tính năng phân công Giảng viên sẽ gọi API update sau
        return ResponseEntity.ok(thesisTopicRepository.save(topic));
    }

    @DeleteMapping("/theses/{id}")
    public ResponseEntity<?> deleteThesis(@PathVariable UUID id) {
        thesisTopicRepository.deleteById(id);
        return ResponseEntity.ok("Xóa đề tài thành công!");
    }
}