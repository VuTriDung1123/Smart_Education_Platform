package com.sep.core_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

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