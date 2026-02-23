package com.sep.core_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.Classroom;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {
    boolean existsByClassCode(String classCode);
}