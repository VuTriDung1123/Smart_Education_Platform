package com.sep.core_service.controller;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import com.sep.core_service.entity.Role;
import com.sep.core_service.entity.User;
import com.sep.core_service.service.UserService;
import com.sep.core_service.repository.RoleRepository;
import com.sep.core_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // 1. Giữ nguyên kiến trúc Service cực chuẩn của Dũng
    @Autowired 
    private UserService userService; 

    // 2. Bổ sung các công cụ cần thiết cho tính năng của Admin
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // 🔥 API CŨ CỦA BẠN: Đăng ký tự do
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    // 🔥 API CŨ CỦA BẠN: Lấy danh sách hiển thị lên bảng
    @GetMapping
    public List<User> getAll() {
        return userService.getAllUsers();
    }

    // 🔥 API MỚI: Dành riêng cho giao diện Admin bấm nút "+ Thêm tài khoản mới"
    @PostMapping("/create-by-admin")
    public User createUserByAdmin(@RequestBody Map<String, String> requestData) {
        String username = requestData.get("username");
        String password = requestData.get("password");
        String fullName = requestData.get("fullName");
        String email = requestData.get("email");
        String roleName = requestData.get("role");

        // Kiểm tra trùng lặp tên đăng nhập
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // Tìm Quyền chuẩn xác trong Database
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền: " + roleName));

        // Tạo User mới với mật khẩu đã được băm (mã hóa) an toàn
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    // 🔥 API SỬA TÀI KHOẢN (UPDATE)
    @PutMapping("/{id}")
    public User updateUser(@PathVariable java.util.UUID id, @RequestBody Map<String, String> requestData) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));
        
        // Cập nhật thông tin (Không cho sửa Username và Password ở đây để bảo mật)
        user.setFullName(requestData.get("fullName"));
        user.setEmail(requestData.get("email"));
        user.setStatus(requestData.get("status")); // ACTIVE hoặc INACTIVE

        // Cập nhật Quyền
        String roleName = requestData.get("role");
        if (roleName != null) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền: " + roleName));
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }

    // 🔥 API XÓA TÀI KHOẢN (DELETE)
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable java.util.UUID id) {
        userRepository.deleteById(id);
    }

    // 🔥 API: IMPORT USER TỪ EXCEL (HỖ TRỢ ĐỌC CẢ CÔNG THỨC EXCEL)
    @PostMapping("/import")
    public ResponseEntity<?> importUsersFromExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File Excel đang trống!");
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<User> usersToSave = new ArrayList<>();
            int countSuccess = 0;

            DataFormatter formatter = new DataFormatter();
            // 🔥 VŨ KHÍ MỚI: Bộ giải mã công thức Excel
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator(); 

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    // 🔥 Truyền thêm evaluator vào để nó tính ra kết quả (STUDENT) thay vì lấy chuỗi =IF(...)
                    String username = formatter.formatCellValue(row.getCell(0), evaluator).trim();
                    String fullName = formatter.formatCellValue(row.getCell(1), evaluator).trim();
                    String email = formatter.formatCellValue(row.getCell(2), evaluator).trim();
                    String rawRole = formatter.formatCellValue(row.getCell(3), evaluator).trim(); 

                    if (username.isEmpty()) continue;

                    if (userRepository.findByUsername(username).isPresent()) {
                        continue;
                    }

                    User user = new User();
                    user.setUsername(username);
                    user.setFullName(fullName);
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode("123456"));
                    user.setStatus("ACTIVE");

                    if (user.getRoles() == null) {
                        user.setRoles(new java.util.HashSet<>());
                    }

                    String safeRoleName = rawRole.toUpperCase();
                    if (!safeRoleName.equals("ADMIN") && !safeRoleName.equals("LECTURER") && !safeRoleName.equals("STUDENT")) {
                        safeRoleName = "STUDENT"; 
                    }

                    Role role = roleRepository.findByName(safeRoleName).orElse(null);
                    if (role != null) {
                        user.getRoles().add(role);
                    }

                    usersToSave.add(user);
                    countSuccess++;
                } catch (Exception e) {
                    System.out.println("❌ Lỗi ở dòng " + i + ": " + e.getMessage());
                }
            }

            if (!usersToSave.isEmpty()) {
                userRepository.saveAll(usersToSave);
            }
            
            return ResponseEntity.ok("✅ Đã import thành công " + countSuccess + " tài khoản!");

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("❌ Lỗi khi đọc file Excel: " + e.getMessage());
        }
    }
}