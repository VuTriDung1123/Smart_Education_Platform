package com.sep.core_service.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sep.core_service.entity.CourseClass;

@Repository
public interface CourseClassRepository extends JpaRepository<CourseClass, UUID> {
}