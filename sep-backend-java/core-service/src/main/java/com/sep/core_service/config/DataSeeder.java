package com.sep.core_service.config;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public void run(String... args) throws Exception {
        Role adminRole = createRoleIfNotFound("ADMIN");
        Role lecturerRole = createRoleIfNotFound("LECTURER");
        Role studentRole = createRoleIfNotFound("STUDENT");

        createUserIfNotFound("admin1", "Trần Quản Trị", "admin1@sep.com", adminRole);
        createUserIfNotFound("admin2", "Lê Hệ Thống", "admin2@sep.com", adminRole);
        createUserIfNotFound("gv01", "Nguyễn Giảng Viên 1", "gv1@sep.com", lecturerRole);
        createUserIfNotFound("gv02", "Phạm Giảng Viên 2", "gv2@sep.com", lecturerRole);
        createUserIfNotFound("sv01", "Vũ Sinh Viên 1", "sv1@sep.com", studentRole);
        createUserIfNotFound("sv02", "Hoàng Sinh Viên 2", "sv2@sep.com", studentRole);

        // Chạy quy trình gieo mầm 2 bước
        seedSubjectsPhase1();
        seedSubjectRelationsPhase2();
    }

    // ==========================================
    // BƯỚC 1: TẠO DANH SÁCH & PHÂN NHÓM TÍN CHỈ
    // ==========================================
    private void seedSubjectsPhase1() {
        System.out.println("⏳ [Phase 1] Đang nạp danh sách và nhóm môn học...");

        // NHÓM CƠ BẢN
        createSubject("0101001202", "Giải tích 1", 3, false, true, "Cơ bản", null, null);
        createSubject("0101001213", "Đại số", 3, false, true, "Cơ bản", null, null);
        createSubject("0101001215", "Xác suất thống kê và xử lý số liệu", 3, false, true, "Cơ bản", null, null);
        
        // NHÓM CHÍNH TRỊ
        createSubject("0101005004", "Pháp luật đại cương", 2, false, true, "Chính trị", null, null);
        createSubject("0101005105", "Triết học Mác - Lênin", 3, false, true, "Chính trị", null, null);
        createSubject("0101005106", "Kinh tế chính trị Mác - Lênin", 2, false, true, "Chính trị", null, null);
        createSubject("0101005107", "Chủ nghĩa xã hội khoa học", 2, false, true, "Chính trị", null, null);
        createSubject("0101005102", "Tư tưởng Hồ Chí Minh", 2, false, true, "Chính trị", null, null);
        createSubject("0101005108", "Lịch sử Đảng cộng sản Việt Nam", 2, false, true, "Chính trị", null, null);

        // NHÓM THỂ CHẤT (Tự chọn nhóm 4 tín chỉ)
        String tcGroup = "Tự chọn Thể chất (Cần 4 TC)";
        createSubject("0101004116", "Bơi 1(*)", 2, true, false, "Thể chất & QP-AN", tcGroup, 4);
        createSubject("0101004117", "Bơi 2(*)", 2, true, false, "Thể chất & QP-AN", tcGroup, 4);
        createSubject("0101004118", "Điền kinh(*)", 2, true, false, "Thể chất & QP-AN", tcGroup, 4);
        createSubject("0101004120", "Bóng đá(*)", 2, true, false, "Thể chất & QP-AN", tcGroup, 4);
        createSubject("0101004124", "Thể dục(*)", 2, true, false, "Thể chất & QP-AN", tcGroup, 4);

        // NHÓM BẮT BUỘC CHUYÊN NGÀNH CNTT
        createSubject("0101122042", "Nhập môn ngành CNTT", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101124101", "Kỹ thuật lập trình", 4, false, true, "Chuyên ngành", null, null);
        createSubject("0101121000", "Cơ sở dữ liệu", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122003", "Lập trình hướng đối tượng", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122044", "Cấu trúc rời rạc", 4, false, true, "Chuyên ngành", null, null);
        createSubject("0101124002", "Cấu trúc dữ liệu và giải thuật", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101121008", "Phân tích thiết kế hệ thống", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101123002", "Mạng máy tính", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101125000", "Kiến trúc máy tính", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101121002", "Thiết kế cơ sở dữ liệu", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122038", "Chuyên đề Hệ thống giao thông thông minh", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101123013", "Lập trình mạng", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122105", "Công nghệ phần mềm", 3, false, true, "Chuyên ngành", null, null);

        // NHÓM TỰ CHỌN CHUYÊN NGÀNH 1 (Cần 12 tín chỉ)
        String cnGroup1 = "Tự chọn Chuyên ngành 1 (Cần 12 TC)";
        createSubject("0101121031", "Lập trình Web", 3, true, true, "Chuyên ngành", cnGroup1, 12);
        createSubject("0101122136", "Lập trình Java", 3, true, true, "Chuyên ngành", cnGroup1, 12);
        createSubject("0101121003", "Hệ quản trị cơ sở dữ liệu", 3, true, true, "Chuyên ngành", cnGroup1, 12);
        createSubject("0101124111", "Internet vạn vật (IoT)", 3, true, true, "Chuyên ngành", cnGroup1, 12);
        
        // NHÓM TỰ CHỌN CHUYÊN NGÀNH 2 (Cần 9 tín chỉ)
        String cnGroup2 = "Tự chọn Chuyên ngành 2 (Cần 9 TC)";
        createSubject("0101121034", "Lập trình thiết bị di động", 3, true, true, "Chuyên ngành", cnGroup2, 9);
        createSubject("0101122010", "XD phần mềm hướng đối tượng", 3, true, true, "Chuyên ngành", cnGroup2, 9);
        createSubject("0101123038", "An ninh mạng", 3, true, true, "Chuyên ngành", cnGroup2, 9);

        // THỰC TẬP & ĐỒ ÁN (Tự chọn nhóm lớn 12 tín)
        String finalGroup = "Thực tập và Đồ án (Cần 12 TC)";
        createSubject("0101126100", "Thực tập tốt nghiệp", 4, true, true, "Chuyên ngành", finalGroup, 12);
        createSubject("0101126201", "Khóa luận tốt nghiệp", 8, true, true, "Chuyên ngành", finalGroup, 12);
        createSubject("0101126202", "Học kỳ doanh nghiệp", 12, true, true, "Chuyên ngành", finalGroup, 12);
    }

    // ==========================================
    // BƯỚC 2: MÓC NỐI MÔN HỌC TRƯỚC (Ràng buộc a)
    // ==========================================
    private void seedSubjectRelationsPhase2() {
        System.out.println("🔗 [Phase 2] Đang thiết lập Môn học trước...");

        // Chính trị
        addPreviousSubject("0101005106", "0101005105"); // KTCT -> học trước Triết
        addPreviousSubject("0101005107", "0101005106", "0101005105"); // CNXHKH -> KTCT, Triết
        addPreviousSubject("0101005102", "0101005107"); // TTHCM -> CNXHKH
        addPreviousSubject("0101005108", "0101005102"); // LS Đảng -> TTHCM

        // Chuyên ngành
        addPreviousSubject("0101122003", "0101124101"); // OOP -> Kỹ thuật lập trình
        addPreviousSubject("0101122044", "0101124101"); // Rời rạc -> Kỹ thuật lập trình
        addPreviousSubject("0101124002", "0101124101"); // CTDL&GT -> Kỹ thuật lập trình
        addPreviousSubject("0101121008", "0101121000"); // PTTKHT -> CSDL
        addPreviousSubject("0101121002", "0101121000", "0101122044", "0101124101"); // Thiết kế CSDL -> CSDL, Rời rạc, KTLT
        
        addPreviousSubject("0101121031", "0101121000", "0101124101"); // Web -> CSDL, KTLT
        addPreviousSubject("0101122136", "0101122003", "0101124101"); // Java -> OOP, KTLT
        addPreviousSubject("0101121034", "0101121000", "0101124101", "0101122003"); // Di động -> CSDL, KTLT, OOP

        // Đồ án & Thực tập
        addPreviousSubject("0101126100", "0101121008", "0101122105", "0101123013"); 
        addPreviousSubject("0101126201", "0101122038", "0101123013", "0101005108");

        System.out.println("✅ Hoàn tất thiết lập cơ sở dữ liệu chương trình đào tạo!");
    }

    // ==========================================
    // CÁC HÀM HELPER HỖ TRỢ
    // ==========================================
    private void createSubject(String code, String name, int credits, boolean isElective, boolean isGpa, String category, String groupName, Integer requiredCredits) {
        if (!subjectRepository.existsBySubjectCode(code)) {
            Subject subject = new Subject();
            subject.setSubjectCode(code);
            subject.setName(name);
            subject.setCredits(credits);
            subject.setIsElective(isElective);
            subject.setIsCalculatedInGpa(isGpa);
            subject.setCategory(category);
            subject.setElectiveGroupName(groupName);
            subject.setRequiredElectiveCredits(requiredCredits);
            subjectRepository.save(subject);
        }
    }

    private void addPreviousSubject(String mainSubjectCode, String... previousSubjectCodes) {
        subjectRepository.findBySubjectCode(mainSubjectCode).ifPresent(mainSubject -> {
            for (String code : previousSubjectCodes) {
                subjectRepository.findBySubjectCode(code).ifPresent(prevSubject -> {
                    mainSubject.getPreviousSubjects().add(prevSubject);
                });
            }
            subjectRepository.save(mainSubject);
        });
    }

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