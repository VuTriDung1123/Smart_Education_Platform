package com.sep.core_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;

@Entity
@Table(name = "classes") // Trong Database vẫn tên là classes
@Getter @Setter
public class CourseClass {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private Lecturer lecturer;

    @Column(nullable = false, length = 20)
    private String semester; // Học kỳ: "HK1", "HK2"

    @Column(nullable = false, length = 20)
    private String academicYear; // Năm học: "2025-2026"

    private String status = "OPEN";
}