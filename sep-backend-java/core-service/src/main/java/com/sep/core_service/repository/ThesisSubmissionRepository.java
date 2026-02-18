package com.sep.core_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.ThesisSubmission;

@Repository
public interface ThesisSubmissionRepository extends JpaRepository<ThesisSubmission, UUID> {
}