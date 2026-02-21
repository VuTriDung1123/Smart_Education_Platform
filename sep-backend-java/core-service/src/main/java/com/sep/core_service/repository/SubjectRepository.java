package com.sep.core_service.repository;

import java.util.UUID;

import com.sep.core_service.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {
    boolean existsBySubjectCode(String subjectCode);
}