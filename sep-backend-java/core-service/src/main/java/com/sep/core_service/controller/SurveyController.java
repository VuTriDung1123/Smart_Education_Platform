package com.sep.core_service.controller;

import com.sep.core_service.entity.*;
import com.sep.core_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    @Autowired private SurveyRepository surveyRepository;
    @Autowired private SurveyQuestionRepository questionRepository;
    @Autowired private SurveyResponseRepository responseRepository;
    @Autowired private SurveyAnswerRepository answerRepository;
    @Autowired private CourseClassRepository classRepository;
    @Autowired private StudentRepository studentRepository;

    // 🔥 API 1: TẠO PHIẾU KHẢO SÁT CHO LỚP
    @PostMapping("/create")
    public Survey createSurvey(
            @RequestParam UUID classId,
            @RequestParam String title) {
        
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học!"));

        Survey survey = new Survey();
        survey.setCourseClass(courseClass);
        survey.setTitle(title);
        survey.setIsActive(true);
        survey.setCreatedAt(LocalDateTime.now());

        return surveyRepository.save(survey);
    }

    // 🔥 API 2: THÊM CÂU HỎI VÀO PHIẾU
    @PostMapping("/add-question")
    public SurveyQuestion addQuestion(
            @RequestParam UUID surveyId,
            @RequestParam String questionText,
            @RequestParam String type) { // TEXT, RATING, MULTIPLE_CHOICE
        
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Phiếu khảo sát!"));

        SurveyQuestion question = new SurveyQuestion();
        question.setSurvey(survey);
        question.setQuestionText(questionText);
        question.setQuestionType(type);

        return questionRepository.save(question);
    }

    // 🔥 API 3: SINH VIÊN BẮT ĐẦU LÀM KHẢO SÁT (Tạo tờ giấy trả lời)
    @PostMapping("/start-response")
    public SurveyResponse startResponse(
            @RequestParam UUID surveyId,
            @RequestParam UUID studentId) {
        
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Phiếu khảo sát!"));
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Sinh viên!"));

        SurveyResponse response = new SurveyResponse();
        response.setSurvey(survey);
        response.setStudent(student);
        response.setSubmittedAt(LocalDateTime.now());

        return responseRepository.save(response);
    }

    // 🔥 API 4: TRẢ LỜI TỪNG CÂU HỎI
    @PostMapping("/submit-answer")
    public SurveyAnswer submitAnswer(
            @RequestParam UUID responseId,
            @RequestParam UUID questionId,
            @RequestParam String answerText) {
        
        SurveyResponse response = responseRepository.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Chưa bắt đầu làm bài!"));
        
        SurveyQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại!"));

        SurveyAnswer answer = new SurveyAnswer();
        answer.setResponse(response);
        answer.setQuestion(question);
        answer.setAnswerText(answerText);

        return answerRepository.save(answer);
    }
}