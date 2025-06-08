package com.example.QuizApp.Service;

import com.example.QuizApp.Model.*;
import com.example.QuizApp.Model.Authentication.UserAuthentication;
import com.example.QuizApp.Repositry.Authentication.UserRepo;
import com.example.QuizApp.Repositry.HistoryRepo;
import com.example.QuizApp.Repositry.QuestionRepo;
import com.example.QuizApp.Repositry.QuizRepo;
import com.example.QuizApp.Service.Authentication.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class QuizService {
    @Autowired
    private QuestionRepo questionRepo;
    @Autowired
    private QuizRepo quizRepo;
    @Autowired
    private HistoryRepo historyRepo;
    @Autowired
    private JwtUtil jwt;
    @Autowired
    private UserRepo userRepo;



    public List<Questions> createQuize(String category, String title,int no) {
        List<Questions> questions=questionRepo.findRandomQuestionByCategory(category, no);
        Quiz quiz=new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);
        quizRepo.save(quiz);
        return questions;
    }


    public List<QuizWrapper> getQuiz(int id) {
        Quiz quiz = quizRepo.findById(id).orElse(null);
        if (quiz == null) return new ArrayList<>();

        List<Questions> questions = quiz.getQuestions();
        List<QuizWrapper> quizq = new ArrayList<>();
        for (Questions q : questions) {
            QuizWrapper qw = new QuizWrapper(q.getId(), q.getQuestion(), q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4());
            quizq.add(qw);


        }
        return quizq;
    }
    @Transactional
    public String deleteQuiz(int quizId) {
        Optional<Quiz> quizOpt = quizRepo.findById(quizId);
        if (quizOpt.isPresent()) {
            Quiz quiz = quizOpt.get();


            quiz.getQuestions().clear();
            quizRepo.save(quiz);

            historyRepo.deleteAllByQuizId(quizId);
            quizRepo.deleteById(quizId);

            return "Quiz deleted successfully.";
        } else {
            return "Quiz not found.";
        }
    }


    public int getScore(String token,int id,List<Response> response) {

        if(response.isEmpty()){
            return -1;
        }
        Quiz quiz = quizRepo.findById(id).orElse(null);
        if (quiz == null) return -1;


        List<Questions> questions=quiz.getQuestions();
        int right=0;
        int i=0;
        for(Response r: response){
            if(r.getRightAnswer().equalsIgnoreCase(questions.get(i).getRightAnswer())){
                right++;


            }
            i++;
        }

        String email = jwt.extractAllEmailId(token);

        System.out.println(email);

        UserAuthentication user = userRepo.findByEmailId(email)
                .orElseThrow(() -> new RuntimeException("Email ID not found: " + email));
        int userID=user.getId();


        History history=new History();
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDate = now.format(formatter);
        history.setQuizId(id);
        history.setUserId(userID);
        history.setQuizName(quiz.getTitle());
        history.setScore(right);
        history.setCrntDate(formattedDate);
        historyRepo.save(history);

        return right;


    }

    public List<QuizInterface> listQuiz() {
     List<Quiz> quiz= quizRepo.findAll();
     List<QuizInterface> qi=new ArrayList<>();

     for(Quiz q: quiz){

         QuizInterface quizInterface=new QuizInterface(q.getId(), q.getTitle());
         qi.add(quizInterface);

     }
     return qi;
    }

    public List<History> listHistoryByUserId(int id) {


        return historyRepo.findByUserIdOrderByCrntDateDesc(id);
    }

    public List<CorrectAnswer> getRightAnswer(int id,List<Response> response) {
        Quiz quiz = quizRepo.findById(id).orElse(null);
        if (quiz == null) return new ArrayList<>();

        List<Questions> questions = quiz.getQuestions();
        List<CorrectAnswer> lca=new ArrayList<>();
        for(Questions q: questions){
            for(Response r : response){
                if(q.getId()==r.getId()){
                    lca.add(new CorrectAnswer(q.getId(),q.getQuestion(),r.getRightAnswer(),q.getRightAnswer()));
                    break;
                }
            }
        }
        return lca;

    }

    public List<TopScorer> getTopScorer(String title) {
        Quiz quiz = quizRepo.findByTitle(title);
        int quizId = quiz.getId();

        List<History> historyList = historyRepo.findByQuizIdOrderByScoreDesc(quizId);
        if(historyList.isEmpty()){
            return new ArrayList<>();
        }
        List<TopScorer> topScorers = new ArrayList<>();

        int rank = 1;
        for (History h : historyList) {
            UserAuthentication user = userRepo.findById(h.getUserId()).orElse(null);
            if (user != null) {
                String username = user.getUserName();
                int score = h.getScore();
                topScorers.add(new TopScorer(rank++, username, title, score));
            }
        }

        return topScorers;
    }

}



