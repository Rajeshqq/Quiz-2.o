package com.example.QuizApp.Repositry;

import com.example.QuizApp.Model.Questions;
import com.example.QuizApp.Model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepo extends JpaRepository<Quiz,Integer> {
    Quiz findByTitle(String title);

}
