package com.example.locationBackEnd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(min = 3, max = 100, message = "Le nom doit contenir entre 3 et 100 caractères")
    private String nomComplet;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le sujet est obligatoire")
    @Size(min = 5, max = 150, message = "Le sujet doit contenir au moins 5 caractères")
    private String sujet;

    @NotBlank(message = "Le message ne peut pas être vide")
    @Size(min = 10, max = 2000, message = "Le message doit contenir entre 10 et 2000 caractères")
    @Column(columnDefinition = "TEXT") // Pour permettre des messages longs en base de données
    private String message;

    private LocalDateTime dateEnvoi;

    // Initialisation automatique de la date avant la sauvegarde
    @PrePersist
    protected void onCreate() {
        this.dateEnvoi = LocalDateTime.now();
    }
}