package com.sep.core_service.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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

    @Column(name = "class_id", nullable = false)
    private UUID classId; // Tạm thời để UUID của lớp học

    private String status = "ENROLLED"; // ENROLLED, DROPPED

    @CreationTimestamp
    private LocalDateTime enrolledAt;

    // Liên kết ngược lại để lấy danh sách điểm của lần đăng ký này
    @OneToMany(mappedBy = "enrollmentId", cascade = CascadeType.ALL)
    private List<GradeScore> scores;
}