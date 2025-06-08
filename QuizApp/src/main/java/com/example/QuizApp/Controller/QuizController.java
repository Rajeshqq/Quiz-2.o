package com.example.QuizApp.Controller;

import com.example.QuizApp.Model.*;
import com.example.QuizApp.Model.Authentication.UserAuthentication;
import com.example.QuizApp.Repositry.Authentication.UserRepo;
import com.example.QuizApp.Repositry.QuizRepo;
import com.example.QuizApp.Service.Authentication.JwtUtil;
import com.example.QuizApp.Service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class QuizController {
    @Autowired
    private QuizService quizService;
    @Autowired
    private JwtUtil jwt;
    @Autowired
    private UserRepo userRepo;
    @PostMapping("/admin/create")
    public ResponseEntity<List<Questions>> createQuiz(@RequestParam String category, @RequestParam String title,@RequestParam int no ){
        return new ResponseEntity<>(quizService.createQuize(category,title,no), HttpStatus.OK);
    }
    @GetMapping("/user/get/{id}")
    public ResponseEntity<?> getQuiz(@PathVariable int id){
        if(quizService.getQuiz(id).isEmpty()){
            return new ResponseEntity<>("there is no quiz",HttpStatus.BAD_GATEWAY);
        }

        return new ResponseEntity<>(quizService.getQuiz(id),HttpStatus.OK);

    }
    @PostMapping("/user/submit/{id}")
    public ResponseEntity<?> calculateScore(@PathVariable int id ,@RequestBody List<Response> response,@RequestHeader("Authorization") String token){
        String jwt = token.substring(7);
        int value=quizService.getScore(jwt,id,response);


        if (value == -1) {


            return new ResponseEntity<>("there is no response or quiz id is wrong",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>("Score of the Quiz is : "+value,HttpStatus.OK);
    }
    @GetMapping("/user/get/quiz")
    public ResponseEntity<List<QuizInterface>> ListQuiz(){
        return new ResponseEntity<>(quizService.listQuiz(),HttpStatus.OK);
    }
    @GetMapping("/user/get/history")
    public  ResponseEntity<List<History>> ListHistory(@RequestHeader("Authorization") String tokenn){
        String token=tokenn.substring(7);
        String emailId=jwt.extractAllEmailId(token);
        UserAuthentication user=userRepo.findByEmailId(emailId).orElseThrow(()->new RuntimeException("email not found"));
        int id = user.getId();
        return new ResponseEntity<>(quizService.listHistoryByUserId(id),HttpStatus.OK);

    }
    @DeleteMapping("admin/delete/quiz/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable int id){
      String ans=quizService.deleteQuiz(id);
      Map<String,Object> json= new HashMap<>();
      json.put("message",ans);
      return new ResponseEntity<>(json,HttpStatus.OK);

    }
    @PostMapping ("user/getRightAnswer/{id}")
    public ResponseEntity<?> getRightAnswer(@PathVariable int id , @RequestBody List<Response> response){
        return new ResponseEntity<>(quizService.getRightAnswer(id,response),HttpStatus.OK);
    }
    @GetMapping("admin/get/TopScorerOfEveryQuiz/{category}")
    public ResponseEntity<?> topScorerOfEveryQuiz(@PathVariable String category){
        List<TopScorer> topScorer=quizService.getTopScorer(category);
        return new ResponseEntity<>(topScorer,HttpStatus.OK);

    }
}
