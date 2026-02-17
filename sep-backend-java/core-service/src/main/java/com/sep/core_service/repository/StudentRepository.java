package com.sep.core_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
}