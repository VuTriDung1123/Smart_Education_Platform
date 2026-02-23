package com.sep.core_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    // Tìm các lớp mà 1 sinh viên đã đăng ký
    List<Enrollment> findByStudent_User_Id(UUID userId);

    // 🔥 DÒNG QUAN TRỌNG ĐỂ SỬA LỖI CONTROLLER: Tìm danh sách sinh viên trong 1 lớp
    List<Enrollment> findByCourseClassId(UUID courseClassId);
}