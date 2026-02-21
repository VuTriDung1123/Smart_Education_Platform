package com.sep.core_service.entity;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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

    private Boolean isCalculatedInGpa = true;
    private Boolean isElective = false;

    @Column(nullable = false)
    private String category = "Chuyên ngành";

    // 🔥 QUẢN LÝ NHÓM TỰ CHỌN TÍN CHỈ
    // Tên nhóm (VD: "Tự chọn Thể chất", "Tự chọn Chuyên ngành 1"). Null nếu là môn bắt buộc.
    private String electiveGroupName; 
    // Số tín chỉ yêu cầu phải hoàn thành trong nhóm này (VD: Cần 4 tín, 12 tín...)
    private Integer requiredElectiveCredits;

    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
    private List<Classroom> classrooms;

    // 🔥 QUẢN LÝ ĐIỀU KIỆN RÀNG BUỘC (Self-referencing)

    // 1. Môn học trước (Ký hiệu 'a' trong tài liệu của bạn)
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "subject_previous",
        joinColumns = @JoinColumn(name = "subject_id"),
        inverseJoinColumns = @JoinColumn(name = "previous_subject_id")
    )
    private Set<Subject> previousSubjects = new HashSet<>();

    // 2. Môn tiên quyết (Ký hiệu 'b')
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "subject_prerequisites",
        joinColumns = @JoinColumn(name = "subject_id"),
        inverseJoinColumns = @JoinColumn(name = "prerequisite_subject_id")
    )
    private Set<Subject> prerequisiteSubjects = new HashSet<>();

    // 3. Môn song hành (Ký hiệu 'c')
    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "subject_corequisites",
        joinColumns = @JoinColumn(name = "subject_id"),
        inverseJoinColumns = @JoinColumn(name = "corequisite_subject_id")
    )
    private Set<Subject> corequisiteSubjects = new HashSet<>();
}