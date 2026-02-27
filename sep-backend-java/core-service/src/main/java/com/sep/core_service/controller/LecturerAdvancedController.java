package com.sep.core_service.controller;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.AttendanceRecord;
import com.sep.core_service.entity.AttendanceSession;
import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Enrollment;
import com.sep.core_service.entity.GradeScore;
import com.sep.core_service.repository.AttendanceRecordRepository;
import com.sep.core_service.repository.AttendanceSessionRepository;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.EnrollmentRepository;
import com.sep.core_service.repository.GradeScoreRepository;

@RestController
@RequestMapping("/api/lecturer/advanced")
public class LecturerAdvancedController {

    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private AttendanceSessionRepository sessionRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private GradeScoreRepository gradeScoreRepository;
    @Autowired private AttendanceRecordRepository recordRepository;

    @PostMapping("/classes/{classId}/qr-attendance")
    public ResponseEntity<?> createQrAttendance(@PathVariable UUID classId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học!"));

        AttendanceSession session = new AttendanceSession();
        session.setCourseClass(classroom); // Đã đổi sang Classroom
        session.setSessionDate(LocalDate.now());
        session.setIsFaceRequired(false);
        session = sessionRepository.save(session);

        String qrData = "SEP_ATTENDANCE_" + classId + "_" + session.getId();
        String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=" + qrData;

        Map<String, String> response = new HashMap<>();
        response.put("sessionId", session.getId().toString());
        response.put("qrUrl", qrUrl);
        response.put("expiresIn", "60"); 
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/classes/{classId}/analytics")
    public ResponseEntity<?> getClassAnalytics(@PathVariable UUID classId) {
        Map<String, Object> data = new HashMap<>();
        List<Enrollment> enrollments = enrollmentRepository.findByCourseClassId(classId); // Mượn hàm cũ của repo
        
        int yeu = 0, tb = 0, kha = 0, gioi = 0, riskCount = 0;
        double sumScore = 0;
        int countScores = 0;

        for (Enrollment e : enrollments) {
            List<GradeScore> scores = gradeScoreRepository.findByEnrollmentId(e.getId());
            if (!scores.isEmpty()) {
                double total = 0;
                for(GradeScore gs : scores) {
                    if(gs.getComponent() != null && gs.getScore() != null) total += gs.getScore() * gs.getComponent().getWeight();
                }
                sumScore += total; countScores++;
                if (total < 4) { yeu++; riskCount++; } else if (total < 6) tb++; else if (total < 8) kha++; else gioi++;
            }
        }

        data.put("scoreDistribution", Arrays.asList(
            Map.of("name", "Yếu (0-4)", "count", yeu), Map.of("name", "TB (4-6)", "count", tb),
            Map.of("name", "Khá (6-8)", "count", kha), Map.of("name", "Giỏi (8-10)", "count", gioi)
        ));
        data.put("averageScore", countScores > 0 ? Math.round((sumScore / countScores) * 10.0) / 10.0 : 0.0);

        List<AttendanceSession> sessions = sessionRepository.findAll().stream().filter(s -> s.getCourseClass().getId().equals(classId)).collect(Collectors.toList());
        List<UUID> sessionIds = sessions.stream().map(AttendanceSession::getId).collect(Collectors.toList());
        int present = 0, absent = 0;

        if (!sessionIds.isEmpty()) {
            for (AttendanceRecord r : recordRepository.findAll().stream().filter(r -> sessionIds.contains(r.getSession().getId())).collect(Collectors.toList())) {
                if ("PRESENT".equalsIgnoreCase(r.getStatus())) present++; else absent++;
            }
        }
        int totalAttendance = present + absent;
        data.put("attendanceRate", Arrays.asList(
            Map.of("name", "Có mặt", "value", totalAttendance > 0 ? (present * 100 / totalAttendance) : (sessions.isEmpty() ? 100 : 0), "fill", "#28a745"),
            Map.of("name", "Vắng mặt", "value", totalAttendance > 0 ? (absent * 100 / totalAttendance) : (sessions.isEmpty() ? 0 : 100), "fill", "#dc3545")
        ));
        data.put("riskStudents", riskCount);
        return ResponseEntity.ok(data);
    }
}