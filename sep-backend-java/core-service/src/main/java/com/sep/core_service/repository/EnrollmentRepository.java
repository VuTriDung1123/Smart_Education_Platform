package com.sep.core_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.Enrollment;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    // Tìm tất cả các môn mà 1 sinh viên đã đăng ký
    List<Enrollment> findByStudentId(UUID studentId);
}