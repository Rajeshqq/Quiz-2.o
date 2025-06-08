package com.example.QuizApp.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CorrectAnswer {
    int qId;
    String question;
    String userAnswer;
    String rightAnswer;
}
