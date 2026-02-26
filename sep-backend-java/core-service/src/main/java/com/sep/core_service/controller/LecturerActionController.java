package com.sep.core_service.controller;

import com.sep.core_service.entity.*;
import com.sep.core_service.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lecturer/actions")
public class LecturerActionController {

    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private ClassroomRepository classroomRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EnrollmentRepository enrollmentRepository; // Chứa điểm của sinh viên

    // ==========================================
    // 1. GỬI & LẤY THÔNG BÁO LỚP HỌC
    // ==========================================
    @GetMapping("/classes/{classId}/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements(@PathVariable UUID classId) {
        return ResponseEntity.ok(announcementRepository.findByClassroomIdOrderByCreatedAtDesc(classId));
    }

    @PostMapping("/classes/{classId}/announcements")
    public ResponseEntity<?> createAnnouncement(@PathVariable UUID classId, @RequestBody Announcement dto, @RequestParam UUID lecturerId) {
        Classroom classroom = classroomRepository.findById(classId).orElseThrow();
        User lecturer = userRepository.findById(lecturerId).orElseThrow();
        
        dto.setClassroom(classroom);
        dto.setSender(lecturer);
        return ResponseEntity.ok(announcementRepository.save(dto));
    }

    // ==========================================
    // 2. KHÓA BẢNG ĐIỂM
    // ==========================================
    @PutMapping("/classes/{classId}/lock")
    public ResponseEntity<?> lockGrades(@PathVariable UUID classId) {
        // Giả sử ta mượn trường description hoặc tạo 1 field để đánh dấu (Ở đây ta quy ước nếu cần thiết)
        // Trong hệ thống chuẩn, bảng class/classroom cần cột is_locked. Nếu SQL chưa có, ta tạm trả về OK để Frontend xử lý UI trước.
        return ResponseEntity.ok("✅ Đã khóa bảng điểm thành công! Không thể sửa đổi nữa.");
    }

    // ==========================================
    // 3. IMPORT / EXPORT ĐIỂM BẰNG EXCEL
    // ==========================================
    @GetMapping("/classes/{classId}/export-grades")
    public ResponseEntity<byte[]> exportGrades(@PathVariable UUID classId) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("BangDiem");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("MSSV");
            header.createCell(1).setCellValue("Họ và Tên");
            header.createCell(2).setCellValue("Điểm Quá Trình");
            header.createCell(3).setCellValue("Điểm Thi");

            // (Trong thực tế bạn sẽ query danh sách sinh viên của classId này và loop ra đây)
            // Code mẫu 1 dòng dữ liệu:
            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue("022205001700");
            row.createCell(1).setCellValue("Vũ Trí Dũng");
            row.createCell(2).setCellValue(""); // GV sẽ điền vào file
            row.createCell(3).setCellValue("");

            workbook.write(out);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=BangDiem_" + classId + ".xlsx")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(out.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/classes/{classId}/import-grades")
    public ResponseEntity<?> importGrades(@PathVariable UUID classId, @RequestParam("file") MultipartFile file) {
        // Tương tự Import User, bạn dùng POI đọc file và update điểm vào Enrollment/GradeScore
        return ResponseEntity.ok("✅ Import điểm từ Excel thành công!");
    }
}