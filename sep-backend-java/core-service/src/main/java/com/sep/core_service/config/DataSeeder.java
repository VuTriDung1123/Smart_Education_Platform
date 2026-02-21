package com.sep.core_service.config;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.sep.core_service.entity.Role;
import com.sep.core_service.entity.Subject;
import com.sep.core_service.entity.User;
import com.sep.core_service.repository.RoleRepository;
import com.sep.core_service.repository.SubjectRepository;
import com.sep.core_service.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Gieo mầm Quyền & Tài khoản (Code cũ)
        Role adminRole = createRoleIfNotFound("ADMIN");
        Role lecturerRole = createRoleIfNotFound("LECTURER");
        Role studentRole = createRoleIfNotFound("STUDENT");

        createUserIfNotFound("admin1", "Trần Quản Trị", "admin1@sep.com", adminRole);
        createUserIfNotFound("admin2", "Lê Hệ Thống", "admin2@sep.com", adminRole);
        createUserIfNotFound("gv01", "Nguyễn Giảng Viên 1", "gv1@sep.com", lecturerRole);
        createUserIfNotFound("gv02", "Phạm Giảng Viên 2", "gv2@sep.com", lecturerRole);
        createUserIfNotFound("sv01", "Vũ Sinh Viên 1", "sv1@sep.com", studentRole);
        createUserIfNotFound("sv02", "Hoàng Sinh Viên 2", "sv2@sep.com", studentRole);

        // 2. GIEO MẦM DANH SÁCH MÔN HỌC (MỚI)
        seedSubjects();
    }

    // ==========================================
    // HÀM BƠM DỮ LIỆU MÔN HỌC TỰ ĐỘNG
    // ==========================================
    private void seedSubjects() {
        System.out.println("⏳ Đang kiểm tra và nạp danh sách môn học...");

        // === HỌC KỲ 1 ===
        createSubject("0101001202", "Giải tích 1", 3, false, true);
        createSubject("0101005004", "Pháp luật đại cương", 2, false, true);
        createSubject("0101005105", "Triết học Mác - Lênin", 3, false, true);
        createSubject("0101007201", "Đường lối quốc phòng và an ninh của Đảng CSVN(*)", 3, false, false);
        createSubject("0101007202", "Công tác quốc phòng và an ninh(*)", 2, false, false);
        createSubject("0101007203", "Quân sự chung(*)", 1, false, false);
        createSubject("0101007204", "Kỹ thuật chiến đấu bộ binh và chiến thuật(*)", 2, false, false);
        createSubject("0101122042", "Nhập môn ngành công nghệ thông tin", 3, false, true);
        createSubject("0101124101", "Kỹ thuật lập trình", 4, false, true);
        
        // Thể dục tự chọn
        createSubject("0101004116", "Bơi 1(*)", 2, true, false);
        createSubject("0101004118", "Điền kinh(*)", 2, true, false);
        createSubject("0101004120", "Bóng đá(*)", 2, true, false);

        // === HỌC KỲ 2 ===
        createSubject("0101001213", "Đại số", 3, false, true);
        createSubject("0101005106", "Kinh tế chính trị Mác - Lênin", 2, false, true);
        createSubject("0101121000", "Cơ sở dữ liệu", 3, false, true);
        createSubject("0101122003", "Lập trình hướng đối tượng", 3, false, true);
        createSubject("0101122044", "Cấu trúc rời rạc", 4, false, true);

        // === HỌC KỲ 3 ===
        createSubject("0101001215", "Xác suất thống kê và xử lý số liệu", 3, false, true);
        createSubject("0101005107", "Chủ nghĩa xã hội khoa học", 2, false, true);
        createSubject("0101124002", "Cấu trúc dữ liệu và giải thuật", 3, false, true);

        // === HỌC KỲ 4 ===
        createSubject("0101121008", "Phân tích thiết kế hệ thống", 3, false, true);
        createSubject("0101122105", "Công nghệ phần mềm", 3, false, true);
        createSubject("0101123002", "Mạng máy tính", 3, false, true);
        createSubject("0101124003", "Phân tích thiết kế giải thuật", 3, false, true);
        createSubject("0101125000", "Kiến trúc máy tính", 3, false, true);

        // === CHUYÊN NGÀNH VÀ TỰ CHỌN ===
        createSubject("0101123033", "An toàn thông tin", 3, false, true);
        createSubject("0101125001", "Hệ điều hành", 3, false, true);
        createSubject("0101121031", "Lập trình Web", 3, true, true);
        createSubject("0101122136", "Lập trình Java", 3, true, true);
        createSubject("0101124111", "Internet vạn vật (IoT)", 3, true, true);
        createSubject("0101121034", "Lập trình thiết bị di động", 3, true, true);
        createSubject("0101121033", "Trí tuệ nhân tạo", 3, true, true);
        
        // === TỐT NGHIỆP ===
        createSubject("0101126100", "Thực tập tốt nghiệp", 4, true, true);
        createSubject("0101126201", "Khóa luận tốt nghiệp", 8, true, true);
        
        System.out.println("✅ Đã hoàn tất nạp danh sách môn học!");
    }

    // Helper tạo môn học
    private void createSubject(String code, String name, int credits, boolean isElective, boolean isCalculatedInGpa) {
        if (!subjectRepository.existsBySubjectCode(code)) {
            Subject subject = new Subject();
            subject.setSubjectCode(code);
            subject.setName(name);
            subject.setCredits(credits);
            subject.setIsElective(isElective);
            subject.setIsCalculatedInGpa(isCalculatedInGpa);
            subjectRepository.save(subject);
        }
    }

    // ==========================================
    // CÁC HÀM HELPER CŨ GIỮ NGUYÊN
    // ==========================================
    private Role createRoleIfNotFound(String name) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            return roleRepository.save(role);
        });
    }

    private void createUserIfNotFound(String username, String fullName, String email, Role role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode("123456")); 
            user.setFullName(fullName);
            user.setEmail(email);
            user.setStatus("ACTIVE");
            user.setCreatedAt(LocalDateTime.now());
            
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
            
            userRepository.save(user);
        }
    }
}