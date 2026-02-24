package com.sep.core_service.entity;

import java.time.LocalDateTime;
import java.util.UUID;

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
@Table(name = "assignments")
@Getter @Setter
public class Assignment {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Classroom classroom; // Lớp học được giao bài

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String fileUrl; // Link tài liệu đính kèm (Lưu Cloudinary)

    private LocalDateTime deadline; // Hạn chót
    
    private Boolean isLateSubmissionAllowed = true; // Cho phép nộp trễ?
    private Double latePenaltyPercentage = 0.0; // Trừ bao nhiêu % nếu nộp trễ
}