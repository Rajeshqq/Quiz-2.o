package com.example.QuizApp.Model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopScorer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int Tid;
    String userName;
    String quizName;
    int score;
}
