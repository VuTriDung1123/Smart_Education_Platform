package com.sep.core_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "academic_summaries")
@Getter @Setter
public class AcademicSummary {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private Double cumulativeGpa4 = 0.0;
    private Integer totalCreditsPassed = 0;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}