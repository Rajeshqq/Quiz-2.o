package com.example.QuizApp.Repositry;

import com.example.QuizApp.Model.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoryRepo extends JpaRepository<History,Integer> {

    List<History> findByUserIdOrderByCrntDateDesc(int userId);
    List<History> findByQuizIdOrderByScoreDesc(int quizId);
    void deleteAllByQuizId(int id);


}
