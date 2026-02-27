package com.sep.core_service.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "enrollments")
@Getter @Setter
public class Enrollment {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // ĐÃ ĐỔI KIỂU DỮ LIỆU THÀNH Classroom
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Classroom courseClass;

    private String status = "ENROLLED"; // ENROLLED, DROPPED

    @CreationTimestamp
    private LocalDateTime enrolledAt;
}