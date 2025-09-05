package com.example.QuizApp;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

@SpringBootApplication
@PropertySource("classpath:.env")
public class QuizAppApplication {

	public static void main(String[] args) {


		SpringApplication.run(QuizAppApplication.class, args);
	}
}
