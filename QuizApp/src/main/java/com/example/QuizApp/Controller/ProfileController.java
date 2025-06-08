package com.example.QuizApp.Controller;

import com.example.QuizApp.Model.Authentication.UserAuthentication;
import com.example.QuizApp.Repositry.Authentication.UserRepo;
import com.example.QuizApp.Service.Authentication.JwtUtil;
import com.example.QuizApp.Service.Authentication.UserDetailService;
import com.example.QuizApp.Service.Authentication.UserRegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ProfileController {

    @Autowired
    private JwtUtil jwtutil;

    @Autowired
    private ApplicationContext context;
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UserRegistrationService registrationService;

    @GetMapping("/profile")
    public ResponseEntity<?> welcome(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>("Missing or invalid Authorization header", HttpStatus.BAD_REQUEST);
        }

        String token = authHeader.substring(7);

        // Extract emailId from token (subject)
        String emailId = jwtutil.extractAllEmailId(token);

        // Load UserDetails by emailId
        UserDetails userDetails = context.getBean(UserDetailService.class).loadUserByUsername(emailId);

        // Validate token
        if (!jwtutil.validateToken(token, userDetails)) {
            return new ResponseEntity<>("Token is expired or invalid", HttpStatus.UNAUTHORIZED);
        }

        // Get user entity
        UserAuthentication user = userRepo.findByEmailId(emailId).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // Extract roles
        List<String> roles = user.getRole().stream()
                .map(role -> role.getName())
                .toList();

        // Build JSON response
        Map<String, Object> json = new HashMap<>();
        json.put("emailId", user.getEmailId());
        json.put("roles", roles);
        json.put("message", "Welcome " + user.getUserName() + ", logged in as " + String.join(", ", roles));

        return new ResponseEntity<>(json, HttpStatus.OK);
    }

}
