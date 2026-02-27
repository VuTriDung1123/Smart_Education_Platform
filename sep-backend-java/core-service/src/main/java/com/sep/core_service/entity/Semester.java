package com.sep.core_service.entity;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

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