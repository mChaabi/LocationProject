package com.example.locationBackEnd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // UUID est recommandé pour les ID de type String
    private String id;

    @NotBlank(message = "La marque est obligatoire")
    private String marque;

    @NotBlank(message = "Le modèle est obligatoire")
    private String modele;

    // Respect de votre nommage spécifique avec L majuscule
    private String imageUrL;

    private String logoMarqueUrL;

    @Positive(message = "Le prix journalier doit être supérieur à 0")
    @Column(nullable = false)
    private Double prixJournalier;

    @Column(nullable = false)
    private boolean disponible = true;

    @NotBlank(message = "Le type de boîte est obligatoire")
    private String typeBoite; // automatique ou manuelle

    private String couleur;

    @Min(value = 1900, message = "Année invalide")
    private int annee;
}