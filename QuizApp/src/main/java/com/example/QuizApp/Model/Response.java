package com.example.QuizApp.Model;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class Response
{
    private int id;
   private String rightAnswer;
}
