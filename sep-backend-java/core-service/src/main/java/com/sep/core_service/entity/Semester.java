package com.sep.core_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "semesters")
@Getter @Setter
public class Semester {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name; // VD: "HK1 2025-2026"

    private LocalDate startDate;
    private LocalDate endDate;

    private Boolean isRegistrationOpen = false; // Mở/đóng đăng ký môn
    private Boolean isActive = true; // Học kỳ hiện tại
}