package com.example.QuizApp.Controller;
import com.example.QuizApp.Model.Questions;
import com.example.QuizApp.Service.QuestionService;
import org.aspectj.weaver.patterns.TypePatternQuestions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class QuestionController {
    @Autowired
    private QuestionService questionService;
    @GetMapping("admin/getQuestions")
    public ResponseEntity<List<Questions>> getAllTheQuestions(){
        return new ResponseEntity<>( questionService.getAllQuestions(), HttpStatus.OK);

    }
    @GetMapping("admin/getQuestionsByCategory/{category}")
    public ResponseEntity<?> getQuestionByCategory(@PathVariable String category){
        if(questionService.getQuestionByCategory(category).isEmpty()){
            return new ResponseEntity<>("Category is not found",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(questionService.getQuestionByCategory(category),HttpStatus.OK);
    }
    @PostMapping("admin/addQuestion")
    public ResponseEntity<String> assQuestions(@RequestBody Questions questions){
       return new ResponseEntity<>( questionService.addQuestion(questions),HttpStatus.CREATED);
    }
    @GetMapping("/randomPic")
    public ResponseEntity<byte[]> randomPic() throws IOException {
        InputStream inputStream=getClass().getClassLoader().getResourceAsStream("images/monkey.jpg");
        if (inputStream == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] bytes=inputStream.readAllBytes();
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"inline").contentLength(bytes.length)
                .contentType(MediaType.IMAGE_JPEG).body(bytes);
    }
    @DeleteMapping("admin/deleteQuestion/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable int id){
        String ans=questionService.deleteQuestionById(id);

        if(ans!=null) {
            Map<String,Object> json=new HashMap<>();
            json.put("Deleted",ans);

            return new ResponseEntity<>(json, HttpStatus.OK);
        }
        return new ResponseEntity<>("Id is not found",HttpStatus.BAD_REQUEST);
    }
    @PutMapping("admin/updateQuestion")
    public ResponseEntity<?> updateQuestion(@RequestBody Questions questions){
        Questions questions1=questionService.updateQuestion(questions);
        return new ResponseEntity<>(questions1,HttpStatus.OK);
    }

}
