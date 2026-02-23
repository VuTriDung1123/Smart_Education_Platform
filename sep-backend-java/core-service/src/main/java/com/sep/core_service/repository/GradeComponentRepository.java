package com.sep.core_service.repository;

import com.sep.core_service.entity.GradeComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface GradeComponentRepository extends JpaRepository<GradeComponent, UUID> {
}