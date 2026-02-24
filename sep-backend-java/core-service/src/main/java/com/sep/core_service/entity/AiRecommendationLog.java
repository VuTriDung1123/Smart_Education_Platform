package com.sep.core_service.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ai_recommendation_logs")
@Getter @Setter
public class AiRecommendationLog {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String recommendationType; // "SUBJECT_SUGGESTION", "RISK_WARNING", "MATERIAL_SUGGEST"

    @Column(columnDefinition = "TEXT")
    private String suggestedContent; // Nội dung AI nhả ra (JSON array môn học)

    private Boolean isAcceptedByStudent; // Sinh viên có click Đăng ký theo AI không?

    @CreationTimestamp
    private LocalDateTime generatedAt;
}