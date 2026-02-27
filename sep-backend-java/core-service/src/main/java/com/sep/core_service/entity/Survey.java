package com.sep.core_service.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
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
@Table(name = "surveys")
@Getter @Setter
public class Survey {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    // ĐÃ ĐỔI KIỂU DỮ LIỆU THÀNH Classroom
    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Classroom courseClass;

    @Column(nullable = false, length = 200)
    private String title;

    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}