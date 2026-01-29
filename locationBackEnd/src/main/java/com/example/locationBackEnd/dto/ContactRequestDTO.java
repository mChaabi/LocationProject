package com.example.locationBackEnd.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequestDTO(
        @NotBlank(message = "Le nom complet est obligatoire") // Ajoutez ceci
        @Size(min = 3, message = "Le nom doit avoir au moins 3 caractères")
        String nomComplet,

        @NotBlank(message = "L'email est obligatoire") // Ajoutez ceci
        @Email(message = "Format d'email invalide")
        String email,

        @NotBlank(message = "Le sujet est obligatoire")
        String sujet,

        @NotBlank(message = "Le message est obligatoire") // Ajoutez ceci
        @Size(min = 10, message = "Le message est trop court (min 10 caractères)")
        String message
) {}