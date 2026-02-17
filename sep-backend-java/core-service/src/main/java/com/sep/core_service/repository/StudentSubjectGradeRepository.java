package com.sep.core_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.StudentSubjectGrade;

@Repository
public interface StudentSubjectGradeRepository extends JpaRepository<StudentSubjectGrade, UUID> {

    List<StudentSubjectGrade> findByStudentId(UUID studentId);
}