package com.example.QuizApp.Service;

import com.example.QuizApp.Model.Questions;
import com.example.QuizApp.Repositry.QuestionRepo;
import org.aspectj.weaver.patterns.TypePatternQuestions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepo questionRepo;
    public List<Questions> getAllQuestions() {
        return questionRepo.findAll();
    }

    public List<Questions> getQuestionByCategory(String category) {
        return questionRepo.findByCategory(category).orElse(null);   }

    public String addQuestion(Questions questions) {
        questionRepo.save(questions);
        return "Question is added";
    }

    public  String deleteQuestionById(int id) {
        if(questionRepo.findById(id).isEmpty()) {
           return null;
        }
        questionRepo.deleteById(id);
        return "successfully deleted";

    }

    public Questions updateQuestion(Questions questions) {
        questionRepo.save(questions);
        return questions;
    }
}
