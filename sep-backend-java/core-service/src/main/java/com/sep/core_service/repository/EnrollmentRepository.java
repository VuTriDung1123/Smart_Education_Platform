package com.sep.core_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    // Kỹ năng mới: Lấy toàn bộ danh sách đăng ký dựa vào ID của Lớp học
    List<Enrollment> findByCourseClassId(UUID courseClassId);
}