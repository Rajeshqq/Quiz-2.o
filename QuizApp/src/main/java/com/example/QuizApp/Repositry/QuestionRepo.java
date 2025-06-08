package com.example.QuizApp.Repositry;

import com.example.QuizApp.Model.Questions;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepo extends JpaRepository<Questions,Integer> {
    public Optional<List<Questions>> findByCategory(String category);
    @Query(value = "SELECT * FROM questions WHERE category = :category ORDER BY RAND() LIMIT :no", nativeQuery = true)
    List<Questions> findRandomQuestionByCategory(@Param("category") String category, @Param("no") int no);


}
