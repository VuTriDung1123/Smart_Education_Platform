package com.sep.core_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Subject;
import com.sep.core_service.repository.SubjectRepository;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        if (subjectRepository.existsBySubjectCode(subject.getSubjectCode())) {
            throw new RuntimeException("Mã học phần đã tồn tại!");
        }
        return subjectRepository.save(subject);
    }

    @PutMapping("/{id}")
    public Subject updateSubject(@PathVariable UUID id, @RequestBody Subject details) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học!"));

        subject.setSubjectCode(details.getSubjectCode());
        subject.setName(details.getName());
        subject.setCredits(details.getCredits());
        subject.setIsElective(details.getIsElective());
        subject.setIsCalculatedInGpa(details.getIsCalculatedInGpa());
        subject.setDescription(details.getDescription());

        return subjectRepository.save(subject);
    }

    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable UUID id) {
        subjectRepository.deleteById(id);
    }
}