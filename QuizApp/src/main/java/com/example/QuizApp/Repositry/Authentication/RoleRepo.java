package com.example.QuizApp.Repositry.Authentication;

import com.example.QuizApp.Model.Authentication.RoleAuthentication;
import com.example.QuizApp.Model.Authentication.UserAuthentication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface RoleRepo extends JpaRepository<RoleAuthentication,Integer> {
    Optional<RoleAuthentication> findByName(String name);
}
