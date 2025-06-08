package com.example.QuizApp.Service.Authentication;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtUtil {

    private final String secretKey = "uP3vnYkQhNc4RxnAqZatJlm7TZ34O1u5CJ4eDzDnhOE=";


    public String generateToken(String emailId, String username, List<String> role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userName", username);
        claims.put("sub",emailId);



        return Jwts.builder().setClaims(claims).issuedAt(new Date(System.currentTimeMillis())).expiration(new Date(System.currentTimeMillis()+1000L*60*30)).signWith(getKey(secretKey)).compact();
    }


    public SecretKey getKey(String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    public String extractAllEmailId(String token) {
        return extractClaim(token, Claims::getSubject);
    }


    public String extractUserName(String token) {
        return extractAllClaims(token).get("userName", String.class);
    }


    public List<String> extractRoles(String token) {
        Object rolesObj = extractAllClaims(token).get("role");
        if (rolesObj instanceof List<?>) {
            return ((List<?>) rolesObj).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return List.of();
    }


    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }


    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey(secretKey))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }


    public Boolean validateToken(String token, UserDetails userDetails) {
        final String emailId = extractAllEmailId(token);
        return (emailId.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
