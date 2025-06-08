package com.example.QuizApp.Controller.Authentication;

import com.example.QuizApp.Model.Authentication.UserAuthentication;
import com.example.QuizApp.Service.Authentication.UserRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RegistrationAndLogin {
    @Autowired
    UserRegistrationService userRegistrationService;
    @PostMapping("/registration")
    public ResponseEntity<ResponseEntity<String>>  registration(@RequestBody UserAuthentication user){
        return new ResponseEntity<>(userRegistrationService.registration(user), HttpStatus.OK);
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserAuthentication user){
        return userRegistrationService.login(user);
    }
}
