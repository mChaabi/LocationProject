package com.example.locationBackEnd.dto;

import jakarta.validation.constraints.*;

public record CarDTO(
        String id,

        @NotBlank(message = "La marque est requise")
        String marque,

        @NotBlank(message = "Le modèle est requis")
        String modele,

        String imageUrL,

        String logoMarqueUrL,

        @Positive(message = "Le prix doit être positif")
        double prixJournalier,

        boolean disponible,

        @NotBlank(message = "Le type de boîte est requis")
        String typeBoite,

        String couleur,

        int annee
) {}