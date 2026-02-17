package com.sep.core_service.repository;

import com.sep.core_service.entity.GradeScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface GradeScoreRepository extends JpaRepository<GradeScore, UUID> {
    // Tìm tất cả điểm số của một sinh viên trong một lớp thông qua enrollmentId
    List<GradeScore> findByEnrollmentId(UUID enrollmentId);
}