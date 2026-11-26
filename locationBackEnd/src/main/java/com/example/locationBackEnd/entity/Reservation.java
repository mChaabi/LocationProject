package com.example.locationBackEnd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "L'ID de la voiture est obligatoire")
    @Column(nullable = false)
    private String carId;

    @NotBlank(message = "L'ID de l'utilisateur est obligatoire")
    @Column(nullable = false)
    private String userId;

    @NotNull(message = "La date de début est obligatoire")
    @FutureOrPresent(message = "La date de début doit être aujourd'hui ou dans le futur")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @Future(message = "La date de fin doit être dans le futur")
    private LocalDate dateFin;

    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "en_attente|confirmee|annulee",
            message = "Le statut doit être : en_attente, confirmee ou annulee")
    private String statut;

    private Double remise;

    @PositiveOrZero(message = "Le prix total ne peut pas être négatif")
    private Double prixTotal;

    private String extras;
}