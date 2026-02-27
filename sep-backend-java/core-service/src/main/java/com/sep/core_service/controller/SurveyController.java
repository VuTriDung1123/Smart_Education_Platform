package com.sep.core_service.controller;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sep.core_service.entity.Classroom;
import com.sep.core_service.entity.Student;
import com.sep.core_service.entity.Survey;
import com.sep.core_service.entity.SurveyAnswer;
import com.sep.core_service.entity.SurveyQuestion;
import com.sep.core_service.entity.SurveyResponse;
import com.sep.core_service.repository.ClassroomRepository;
import com.sep.core_service.repository.StudentRepository;
import com.sep.core_service.repository.SurveyAnswerRepository;
import com.sep.core_service.repository.SurveyQuestionRepository;
import com.sep.core_service.repository.SurveyRepository;
import com.sep.core_service.repository.SurveyResponseRepository;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    @Autowired private SurveyRepository surveyRepository;
    @Autowired private SurveyQuestionRepository questionRepository;
    @Autowired private SurveyResponseRepository responseRepository;
    @Autowired private SurveyAnswerRepository answerRepository;
    @Autowired private ClassroomRepository classRepository; // Đã sửa thành ClassroomRepository
    @Autowired private StudentRepository studentRepository;

    @PostMapping("/create")
    public Survey createSurvey(
            @RequestParam UUID classId,
            @RequestParam String title) {
        
        Classroom classroom = classRepository.findById(classId) // Đã sửa
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học!"));

        Survey survey = new Survey();
        survey.setCourseClass(classroom); // Đã sửa
        survey.setTitle(title);
        survey.setIsActive(true);
        survey.setCreatedAt(LocalDateTime.now());

        return surveyRepository.save(survey);
    }

    @PostMapping("/add-question")
    public SurveyQuestion addQuestion(
            @RequestParam UUID surveyId,
            @RequestParam String questionText,
            @RequestParam String type) { 
        
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Phiếu khảo sát!"));

        SurveyQuestion question = new SurveyQuestion();
        question.setSurvey(survey);
        question.setQuestionText(questionText);
        question.setQuestionType(type);

        return questionRepository.save(question);
    }

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