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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "student_subject_grades", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "subject_id", "semester"})
})
@Getter @Setter
public class StudentSubjectGrade {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    private Integer creditsAtTime; // Số tín chỉ của môn lúc học (phòng khi sau này trường đổi tín chỉ)
    
    private Double score10;
    private Double score4;

    @Column(length = 5)
    private String gradeLetter;

    @Column(length = 20)
    private String semester;
}