package com.example.QuizApp.Service.Authentication;

import com.example.QuizApp.Model.Authentication.UserAuthentication;
import com.example.QuizApp.Model.Authentication.UserPrinciple;
import com.example.QuizApp.Repositry.Authentication.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String emailID) throws UsernameNotFoundException {
        UserAuthentication userAuthentication = userRepo.findByEmailId(emailID).orElse(null);
        if (userAuthentication == null) {
            System.out.println("Email is not found");
            throw new UsernameNotFoundException("EmailId is not found: " + emailID);
        }
        return new UserPrinciple(userAuthentication);
    }
}
