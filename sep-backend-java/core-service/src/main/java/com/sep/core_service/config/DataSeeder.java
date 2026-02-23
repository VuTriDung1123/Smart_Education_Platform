package com.sep.core_service.config;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
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
        // 1. Tạo Role
        Role adminRole = createRoleIfNotFound("ADMIN");
        Role lecturerRole = createRoleIfNotFound("LECTURER");
        Role studentRole = createRoleIfNotFound("STUDENT");

        // 2. Tạo Tài khoản Admin & Giảng viên
        createUserIfNotFound("admin1", "Trần Quản Trị", "admin1@sep.com", adminRole);
        createUserIfNotFound("admin2", "Lê Hệ Thống", "admin2@sep.com", adminRole);
        createUserIfNotFound("gv01", "Nguyễn Giảng Viên 1", "gv1@sep.com", lecturerRole);
        createUserIfNotFound("gv02", "Phạm Giảng Viên 2", "gv2@sep.com", lecturerRole);
        
        // 3. Tạo Sinh viên có Profile đầy đủ (Không nạp điểm ảo nữa)
        createUserIfNotFound("sv01", "Vũ Trí Dũng", "sv1@sep.com", studentRole, "022205001700", "23/11/2005", "Quảng Ninh", "Nam");
        createUserIfNotFound("sv02", "Hoàng Sinh Viên 2", "sv2@sep.com", studentRole, "022205001701", "01/01/2005", "Hà Nội", "Nam");

        // 4. Nạp dữ liệu Môn học & Ràng buộc (Chạy qua hàm Check nên không sợ trùng)
        seedSubjectsPhase1();
        seedSubjectRelationsPhase2();
    }

    // ==========================================
    // BƯỚC 1: TẠO FULL 100% DANH SÁCH MÔN HỌC
    // ==========================================
    private void seedSubjectsPhase1() {
        System.out.println("⏳ [Phase 1] Đang nạp toàn bộ danh sách môn học...");

        // --- CÁC MÔN BẮT BUỘC CHUNG ---
        createSubject("0101001202", "Giải tích 1", 3, false, true, "Cơ bản", null, null);
        createSubject("0101005004", "Pháp luật đại cương", 2, false, true, "Chính trị", null, null);
        createSubject("0101005105", "Triết học Mác - Lênin", 3, false, true, "Chính trị", null, null);
        createSubject("0101007201", "Đường lối quốc phòng và an ninh của đảng cộng sản VN(*)", 3, false, false, "Thể chất & QP-AN", null, null);
        createSubject("0101007202", "Công tác quốc phòng và an ninh(*)", 2, false, false, "Thể chất & QP-AN", null, null);
        createSubject("0101007203", "Quân sự chung(*)", 1, false, false, "Thể chất & QP-AN", null, null);
        createSubject("0101007204", "Kỹ thuật chiến đấu bộ binh và chiến thuật(*)", 2, false, false, "Thể chất & QP-AN", null, null);
        createSubject("0101122042", "Nhập môn ngành công nghệ thông tin", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101124101", "Kỹ thuật lập trình", 4, false, true, "Chuyên ngành", null, null);
        createSubject("0101001213", "Đại số", 3, false, true, "Cơ bản", null, null);
        createSubject("0101005106", "Kinh tế chính trị Mác - Lênin", 2, false, true, "Chính trị", null, null);
        createSubject("0101121000", "Cơ sở dữ liệu", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122003", "Lập trình hướng đối tượng", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122044", "Cấu trúc rời rạc", 4, false, true, "Chuyên ngành", null, null);
        createSubject("0101001215", "Xác suất thống kê và xử lý số liệu thực nghiệm", 3, false, true, "Cơ bản", null, null);
        createSubject("0101005107", "Chủ nghĩa xã hội khoa học", 2, false, true, "Chính trị", null, null);
        createSubject("0101124002", "Cấu trúc dữ liệu và giải thuật", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101121008", "Phân tích thiết kế hệ thống", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122105", "Công nghệ phần mềm", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101123002", "Mạng máy tính", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101124003", "Phân tích thiết kế giải thuật", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101125000", "Kiến trúc máy tính", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101123033", "An toàn thông tin", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101125001", "Hệ điều hành", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101005102", "Tư tưởng Hồ Chí Minh", 2, false, true, "Chính trị", null, null);
        createSubject("0101121002", "Thiết kế cơ sở dữ liệu", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101121137", "Quản trị doanh nghiệp CNTT", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101122038", "Chuyên đề Hệ thống giao thông thông minh", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101123013", "Lập trình mạng", 3, false, true, "Chuyên ngành", null, null);
        createSubject("0101005108", "Lịch sử Đảng cộng sản Việt Nam", 2, false, true, "Chính trị", null, null);

        // --- NHÓM TỰ CHỌN THỂ CHẤT ---
        String grpTheChat = "Tự chọn Thể chất";
        createSubject("0101004116", "Bơi 1(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004117", "Bơi 2(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004118", "Điền kinh(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004119", "Bóng chuyền(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004120", "Bóng đá(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004121", "Bóng rổ(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004122", "Bóng bàn(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004123", "Cờ vua(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004124", "Thể dục(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004125", "Thể dục thể hình căn bản - Fitness 1(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004126", "Thể dục thể hình nâng cao - Fitness 2(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);
        createSubject("0101004127", "Vovinam(*)", 2, true, false, "Thể chất & QP-AN", grpTheChat, 0);

        // --- NHÓM TỰ CHỌN KỸ NĂNG & CƠ SỞ (12 TC) ---
        String grpTuChon12 = "Tự chọn (Cần 12 TC)";
        createSubject("0101080103", "Tư duy thiết kế và đổi mới sáng tạo", 3, true, true, "Cơ bản", grpTuChon12, 12);
        createSubject("0101121003", "Hệ quản trị cơ sở dữ liệu", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101121031", "Lập trình Web", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101122136", "Lập trình Java", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101123043", "Thiết kế mạng", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101123044", "Mạng máy tính nâng cao", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101124006", "Thương mại điện tử", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101124105", "Luật Công nghệ thông tin", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101124111", "Internet vạn vật (IoT)", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101125103", "Kỹ thuật truyền số liệu", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101151010", "Kinh tế tuần hoàn và phát triển bền vững", 3, true, true, "Cơ bản", grpTuChon12, 12);
        createSubject("0101121033", "Trí tuệ nhân tạo", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101121036", "Xử lý ảnh và thị giác máy tính", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101122040", "Kiểm chứng phần mềm", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101122041", "Khai thác dữ liệu", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101123039", "Điện toán đám mây", 3, true, true, "Chuyên ngành", grpTuChon12, 12);
        createSubject("0101124008", "Công nghệ phần mềm nhúng", 3, true, true, "Chuyên ngành", grpTuChon12, 12);

        // --- NHÓM TỰ CHỌN CHUYÊN SÂU (9 TC) ---
        String grpTuChon9 = "Tự chọn Chuyên sâu (Cần 9 TC)";
        createSubject("0101121034", "Lập trình thiết bị di động", 3, true, true, "Chuyên ngành", grpTuChon9, 9);
        createSubject("0101122010", "XD phần mềm hướng đối tượng", 3, true, true, "Chuyên ngành", grpTuChon9, 9);
        createSubject("0101122039", "Đồ án thực tế công nghệ phần mềm", 3, true, true, "Chuyên ngành", grpTuChon9, 9);
        createSubject("0101123005", "Quản trị mạng", 3, true, true, "Chuyên ngành", grpTuChon9, 9);
        createSubject("0101123015", "Quản trị dự án CNTT", 3, true, true, "Chuyên ngành", grpTuChon9, 9);
        createSubject("0101123038", "An ninh mạng", 3, true, true, "Chuyên ngành", grpTuChon9, 9);

        // --- NHÓM TỰ CHỌN ĐỒ ÁN / THỰC TẬP TỐT NGHIỆP (12 TC) ---
        String grpTotNghiep = "Tự chọn Tốt nghiệp (Cần 12 TC)";
        createSubject("0101122045", "Chuyên đề - Phát triển hệ thống thông minh", 4, true, true, "Chuyên ngành", grpTotNghiep, 12);
        createSubject("0101123046", "Chuyên đề - Hệ thống mạng và bảo mật", 4, true, true, "Chuyên ngành", grpTotNghiep, 12);
        createSubject("0101124014", "Chuyên đề - Các giải thuật tối ưu", 4, true, true, "Chuyên ngành", grpTotNghiep, 12);
        createSubject("0101126100", "Thực tập tốt nghiệp", 4, true, true, "Chuyên ngành", grpTotNghiep, 12);
        createSubject("0101126201", "Khóa luận tốt nghiệp", 8, true, true, "Chuyên ngành", grpTotNghiep, 12);
        createSubject("0101126202", "Học kỳ doanh nghiệp", 12, true, true, "Chuyên ngành", grpTotNghiep, 12);
    }

    // ==========================================
    // BƯỚC 2: GẮN ĐIỀU KIỆN MÔN HỌC TRƯỚC (Ràng buộc "a")
    // ==========================================
    private void seedSubjectRelationsPhase2() {
        System.out.println("🔗 [Phase 2] Đang thiết lập các Môn học trước (Ràng buộc)...");

        // Các môn Chính trị
        addPreviousSubject("0101005106", "0101005105"); 
        addPreviousSubject("0101005107", "0101005106", "0101005105"); 
        addPreviousSubject("0101005102", "0101005107"); 
        addPreviousSubject("0101005108", "0101005102"); 

        // Các môn Chuyên ngành cơ sở
        addPreviousSubject("0101122003", "0101124101"); 
        addPreviousSubject("0101122044", "0101124101"); 
        addPreviousSubject("0101124002", "0101124101"); 
        addPreviousSubject("0101121008", "0101121000"); 
        addPreviousSubject("0101124003", "0101124002"); 
        addPreviousSubject("0101125001", "0101125000"); 
        addPreviousSubject("0101121002", "0101121000", "0101122044", "0101124101"); 
        addPreviousSubject("0101122038", "0101124101"); 
        addPreviousSubject("0101123013", "0101124101", "0101123002"); 

        // Các môn Tự chọn chuyên sâu
        addPreviousSubject("0101121003", "0101121000");
        addPreviousSubject("0101121031", "0101121000", "0101124101");
        addPreviousSubject("0101122136", "0101122003", "0101124101");
        addPreviousSubject("0101123043", "0101123002");
        addPreviousSubject("0101124111", "0101124101");
        addPreviousSubject("0101125103", "0101123002");
        addPreviousSubject("0101121034", "0101121000", "0101124101", "0101122003");
        addPreviousSubject("0101122010", "0101122003", "0101122105");
        addPreviousSubject("0101122039", "0101124101", "0101122105");
        addPreviousSubject("0101123005", "0101123002");
        addPreviousSubject("0101123015", "0101122105");
        addPreviousSubject("0101123038", "0101123002");
        addPreviousSubject("0101121033", "0101124002");
        addPreviousSubject("0101121036", "0101124002");
        addPreviousSubject("0101122040", "0101122105");
        addPreviousSubject("0101122041", "0101124101");
        addPreviousSubject("0101123039", "0101123002");
        addPreviousSubject("0101124008", "0101124101", "0101125000");

        // Các môn Thực tập / Đồ án / Chuyên đề
        addPreviousSubject("0101122045", "0101122038", "0101123013", "0101005108");
        addPreviousSubject("0101123046", "0101122038", "0101123013", "0101005108");
        addPreviousSubject("0101124014", "0101122038", "0101123013", "0101005108");
        addPreviousSubject("0101126100", "0101121008", "0101122105", "0101123013", "0101124003");
        addPreviousSubject("0101126201", "0101122038", "0101123013", "0101005108");
        addPreviousSubject("0101126202", "0101122038", "0101123013", "0101005108");

        System.out.println("✅ Hoàn tất toàn bộ dữ liệu hệ thống!");
    }

    // ==========================================
    // CÁC HÀM HELPER 
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

    private User createUserIfNotFound(String username, String fullName, String email, Role role) {
        return createUserIfNotFound(username, fullName, email, role, null, null, null, null);
    }

    private User createUserIfNotFound(String username, String fullName, String email, Role role, String studentCode, String dob, String place, String gender) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        
        // Nếu tài khoản đã tồn tại
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Kiểm tra nếu tài khoản cũ chưa có MSSV thì cập nhật luôn
            if (user.getStudentCode() == null && studentCode != null) {
                user.setStudentCode(studentCode);
                user.setDateOfBirth(dob);
                user.setPlaceOfBirth(place);
                user.setGender(gender);
                user.setMajor("Công nghệ thông tin");
                user.setBatch("2023");
                return userRepository.save(user); // Lưu bản cập nhật
            }
            return user; // Đã có đủ thông tin thì trả về luôn
        }

        // Nếu tài khoản chưa từng tồn tại -> Tạo mới 100%
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("123456")); 
        user.setFullName(fullName);
        user.setEmail(email);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        
        // Set thông tin sinh viên
        user.setStudentCode(studentCode);
        user.setDateOfBirth(dob);
        user.setPlaceOfBirth(place);
        user.setGender(gender);
        user.setMajor("Công nghệ thông tin");
        user.setBatch("2023");
        
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);
        return userRepository.save(user);
    }
}