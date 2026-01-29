package com.example.locationBackEnd.dto;

import java.time.LocalDateTime;

public record UserResponseDTO(
        Long id,
        String nom,
        String prenom,
        String email,
        String telephone,
        String role,
        LocalDateTime dateInscription
) {}