package com.sep.core_service.entity;

import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "classrooms")
@Getter @Setter
public class Classroom {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String classCode;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "lecturer_id")
    private User lecturer;

    @ManyToMany
    @JoinTable(
        name = "classroom_students",
        joinColumns = @JoinColumn(name = "classroom_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<User> students;

    // 🔥 CÁC TRƯỜNG ĐƯỢC GỘP TỪ COURSECLASS SANG ĐỂ QUẢN LÝ LỊCH HỌC
    @Column(length = 20)
    private String semester = "HK1";
    
    @Column(length = 20)
    private String academicYear = "2024-2025";
    
    private String status = "OPEN";
    private Integer dayOfWeek;
    private Integer session;
    private String tiet;
    private String time;
    private String room;
}