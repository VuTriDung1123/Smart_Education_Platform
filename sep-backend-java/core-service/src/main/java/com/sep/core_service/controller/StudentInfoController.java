package com.sep.core_service.controller;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.Subject;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.StudentSubjectGradeRepository;
import com.sep.core_service.repository.SubjectRepository;
import com.sep.core_service.repository.UserRepository;

@RestController
@RequestMapping("/api/students/info")
public class StudentInfoController {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private StudentSubjectGradeRepository gradeRepository;

    private Student getCurrentStudent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return studentRepository.findById(user.getId()).orElseThrow();
    }

    @GetMapping("/timetable")
    public ResponseEntity<?> getTimetable() {
        Student student = getCurrentStudent();
        List<Map<String, Object>> timetable = enrollmentRepository.findByStudent_User_Id(student.getId()).stream()
                .filter(e -> "ENROLLED".equals(e.getStatus()))
                .map(e -> {
                    Classroom c = e.getCourseClass(); // Đã tự động cast thành Classroom
                    Map<String, Object> map = new HashMap<>();
                    map.put("dayOfWeek", c.getDayOfWeek() != null ? c.getDayOfWeek() : 2); 
                    map.put("session", c.getSession() != null ? c.getSession() : 1);       
                    map.put("subject", c.getSubject().getName());
                    map.put("code", c.getSubject().getSubjectCode());
                    map.put("tiet", c.getTiet() != null ? c.getTiet() : "1 - 3");
                    map.put("time", c.getTime() != null ? c.getTime() : "06:45 - 09:15");
                    map.put("room", c.getRoom() != null ? c.getRoom() : "Phòng chờ");
                    return map;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(timetable);
    }

    @GetMapping("/curriculum")
    public ResponseEntity<?> getCurriculum() {
        Student student = getCurrentStudent();
        Set<UUID> passedIds = gradeRepository.findByStudentId(student.getId()).stream().filter(g -> g.getScore10() != null && g.getScore10() >= 4.0).map(g -> g.getSubject().getId()).collect(Collectors.toSet());
        Set<UUID> studyingIds = enrollmentRepository.findByStudent_User_Id(student.getId()).stream().filter(e -> "ENROLLED".equals(e.getStatus())).map(e -> e.getCourseClass().getSubject().getId()).collect(Collectors.toSet());

        Map<String, List<Map<String, Object>>> groupedSubjects = new HashMap<>();
        for (Subject sub : subjectRepository.findAll()) {
            String cat = sub.getCategory() == null || sub.getCategory().isEmpty() ? "Kiến thức chuyên ngành" : sub.getCategory();
            String status = passedIds.contains(sub.getId()) ? "PASSED" : (studyingIds.contains(sub.getId()) ? "STUDYING" : "NOT_STARTED");
            Map<String, Object> subMap = new HashMap<>();
            subMap.put("name", sub.getName() + " (" + sub.getSubjectCode() + ")");
            subMap.put("credits", sub.getCredits());
            subMap.put("status", status);
            groupedSubjects.computeIfAbsent(cat, k -> new ArrayList<>()).add(subMap);
        }

        List<Map<String, Object>> curriculum = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : groupedSubjects.entrySet()) {
            Map<String, Object> group = new HashMap<>();
            group.put("semester", "Khối kiến thức: " + entry.getKey());
            group.put("subjects", entry.getValue());
            curriculum.add(group);
        }
        return ResponseEntity.ok(curriculum);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Student student = getCurrentStudent();
        User user = student.getUser();
        Map<String, Object> profile = new HashMap<>();
        profile.put("major", user.getMajor() != null ? user.getMajor() : "Công nghệ Thông tin");
        profile.put("batch", user.getBatch() != null ? user.getBatch() : "Khóa K22 (2022-2026)");
        profile.put("email", user.getEmail() != null ? user.getEmail() : "student@ut.edu.vn");
        profile.put("phone", "Chưa cập nhật");
        profile.put("status", student.getAcademicStatus() != null ? student.getAcademicStatus() : "Đang học");
        return ResponseEntity.ok(profile);
    }
}