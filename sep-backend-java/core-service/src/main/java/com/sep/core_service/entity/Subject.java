package com.sep.core_service.entity;

import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subjects")
@Getter @Setter
public class Subject {
    
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(unique = true, nullable = false)
    private String subjectCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer credits;

    // Để đánh dấu môn nào tính vào GPA (Ví dụ: Thể dục, GDQP -> false)
    private Boolean isCalculatedInGpa = true;

    // Phân loại: Môn tự chọn (true) hay Bắt buộc (false)
    private Boolean isElective = false;

    private String description;

    // Liên kết: Một môn học có thể có nhiều lớp được mở
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
    private List<Classroom> classrooms;
}