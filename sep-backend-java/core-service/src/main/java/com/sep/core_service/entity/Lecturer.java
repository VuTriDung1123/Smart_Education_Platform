package com.sep.core_service.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "lecturers")
@Getter @Setter
public class Lecturer {
    @Id
    private UUID id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private User user; // Nối 1-1 với bảng users

    @Column(unique = true, nullable = false, length = 20)
    private String lecturerCode;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(length = 50)
    private String degree; // Học vị: Thạc sĩ, Tiến sĩ...
}