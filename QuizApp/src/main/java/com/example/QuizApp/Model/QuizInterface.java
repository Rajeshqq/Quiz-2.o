package com.example.QuizApp.Model;

import lombok.Data;

@Data
public class QuizInterface {
    int id;
    String name;
    public QuizInterface(int id,String name){
        this.id=id;
        this.name=name;
    }

}
