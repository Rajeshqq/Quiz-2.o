package com.example.QuizApp.Service.Authentication;

import com.example.QuizApp.Model.Authentication.RoleAuthentication;
import com.example.QuizApp.Model.Authentication.UserAuthentication;
import com.example.QuizApp.Repositry.Authentication.RoleRepo;
import com.example.QuizApp.Repositry.Authentication.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserRegistrationService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private AuthenticationManager authmanager;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public ResponseEntity<String> registration(UserAuthentication user) {
        if (userRepo.findByEmailId(user.getEmailId()).isPresent()) {
            return new ResponseEntity<>("The email ID is already registered", HttpStatus.CONFLICT);
        }

        RoleAuthentication defaultRole = roleRepo.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        Set<RoleAuthentication> attachedRoles = new HashSet<>();
        attachedRoles.add(defaultRole);

        user.setRole(attachedRoles);
        user.setPassword(encoder.encode(user.getPassword()));
        userRepo.save(user);

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    public ResponseEntity<?> login(UserAuthentication user) {
        try {
            Authentication authentication = authmanager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmailId(), user.getPassword())
            );

            if (authentication.isAuthenticated()) {
                UserAuthentication dbUser = userRepo.findByEmailId(user.getEmailId())
                        .orElseThrow(() -> new RuntimeException("User not found"));

                List<String> roles = dbUser.getRole().stream()
                        .map(RoleAuthentication::getName)
                        .collect(Collectors.toList());


                String token = jwtUtil.generateToken(dbUser.getEmailId(), dbUser.getUserName(), roles);

                Map<String, String> response = new HashMap<>();
                response.put("token", token);

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + e.getMessage());
        }
    }





}
