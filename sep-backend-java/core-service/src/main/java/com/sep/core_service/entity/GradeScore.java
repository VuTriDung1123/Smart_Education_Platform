package com.sep.core_service.entity;

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
@Table(name = "grade_scores")
@Getter @Setter
public class GradeScore {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    // Liên kết với bảng Enrollments (Sinh viên đăng ký lớp nào)
    // Giả sử Dũng đã có Entity Enrollment, nếu chưa mình sẽ bổ sung sau
    @Column(name = "enrollment_id")
    private UUID enrollmentId;

    // Liên kết với cột điểm nào (Chuyên cần hay Học kỳ)
    @ManyToOne
    @JoinColumn(name = "component_id")
    private GradeComponent component;

    @Column(nullable = false)
    private Double score; // Điểm hệ 10 (0.0 - 10.0)
}