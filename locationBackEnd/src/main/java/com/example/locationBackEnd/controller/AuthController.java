package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.dto.UserResponseDTO;
import com.example.locationBackEnd.mapper.UserMapper;
import com.example.locationBackEnd.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private final UserRepository users;
    private final UserMapper mapper;
    private final BCryptPasswordEncoder encoder;

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}

    @PostMapping("/login")
    public UserResponseDTO login(@Valid @RequestBody LoginRequest r) {
        return users.findByEmail(r.email())
                .filter(u -> encoder.matches(r.password(), u.getPassword()))
                .map(mapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect"));
    }
}
