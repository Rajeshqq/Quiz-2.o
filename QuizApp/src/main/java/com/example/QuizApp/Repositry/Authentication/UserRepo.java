package com.example.QuizApp.Repositry.Authentication;

import com.example.QuizApp.Model.Authentication.UserAuthentication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepo extends JpaRepository<UserAuthentication,Integer> {
    Optional<UserAuthentication> findByEmailId(String emailId);



}

