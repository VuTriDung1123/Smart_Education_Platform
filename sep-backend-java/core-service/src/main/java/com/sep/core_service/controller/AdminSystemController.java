package com.sep.core_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.AiRecommendationLog;
import com.sep.core_service.entity.Survey;
import com.sep.core_service.repository.AiRecommendationLogRepository;
import com.sep.core_service.repository.SurveyRepository;

@RestController
@RequestMapping("/api/admin/system")
public class AdminSystemController {

    @Autowired private SurveyRepository surveyRepository;
    @Autowired private AiRecommendationLogRepository aiLogRepository;

    // ==========================================
    // 1. QUẢN LÝ KHẢO SÁT
    // ==========================================
    @GetMapping("/surveys")
    public ResponseEntity<List<Survey>> getAllSurveys() {
        return ResponseEntity.ok(surveyRepository.findAll());
    }

    @PutMapping("/surveys/{id}/toggle")
    public ResponseEntity<?> toggleSurvey(@PathVariable UUID id) {
        Survey survey = surveyRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát"));
        survey.setIsActive(!survey.getIsActive());
        return ResponseEntity.ok(surveyRepository.save(survey));
    }

    @DeleteMapping("/surveys/{id}")
    public ResponseEntity<?> deleteSurvey(@PathVariable UUID id) {
        surveyRepository.deleteById(id);
        return ResponseEntity.ok("Đã xóa khảo sát!");
    }

    // ==========================================
    // 2. QUẢN LÝ LOG AI & HỆ THỐNG
    // ==========================================
    @GetMapping("/ai-logs")
    public ResponseEntity<List<AiRecommendationLog>> getAiLogs() {
        return ResponseEntity.ok(aiLogRepository.findAll());
    }
}