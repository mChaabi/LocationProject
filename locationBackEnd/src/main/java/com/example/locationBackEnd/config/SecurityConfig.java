package com.example.locationBackEnd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // Autoriser l'accès aux voitures (lecture/recherche)
                        .requestMatchers("/cars/**").permitAll()

                        // Autoriser l'envoi de messages de contact
                        .requestMatchers("/contacts/**").permitAll()

                        // Autoriser l'inscription et la connexion
                        .requestMatchers("/auth/**").permitAll()

                        // Autoriser les réservations (pour l'instant ouvert pour tes tests)
                        .requestMatchers("/reservations/**").permitAll()

                        // Garder ceci pour autoriser tout le reste durant le développement
                        .anyRequest().permitAll()
                )
                .httpBasic(withDefaults());

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
