package com.example.locationBackEnd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(withDefaults()) // Active la configuration CORS (ton WebConfig)
                .authorizeHttpRequests(auth -> auth
                        // Utilise "/**" pour autoriser absolument TOUT sans restriction pour l'instant
                        // Ou sois très spécifique si tu gardes le préfixe
                        .requestMatchers("/cars/**").permitAll()
                        .requestMatchers("/api/cars/**").permitAll() // Ajoute cette ligne par sécurité
                        .requestMatchers("/users/**").permitAll()
                        .anyRequest().permitAll() // CHANGE TEMPORAIREMENT ICI pour tester
                )
                .httpBasic(withDefaults());

        return http.build();
    }
}
