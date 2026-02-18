package com.sep.core_service.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter @Setter
public class Student {
    @Id
    @Column(name = "id")
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user; // Kết nối 1-1 với bảng Users

    @Column(unique = true, nullable = false)
    private String studentCode;

    private Integer enrollmentYear;
    
    private String academicStatus = "STUDYING";
}