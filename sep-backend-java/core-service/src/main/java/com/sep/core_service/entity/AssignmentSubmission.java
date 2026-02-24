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
@Table(name = "assignment_submissions")
@Getter @Setter
public class AssignmentSubmission {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String fileUrl; // Link bài làm sinh viên nộp
    
    private LocalDateTime submittedAt;
    
    private String status; // "ON_TIME", "LATE", "MISSING"
    
    private Double score; // Điểm GV chấm
    
    @Column(columnDefinition = "TEXT")
    private String feedback; // Lời phê của GV
    
    private Integer version = 1; // Hỗ trợ nộp lại nhiều lần
}