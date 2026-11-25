package com.example.locationBackEnd.dto;

import java.time.LocalDate;

public record ReservationResponse(
        Long id,
        String carName,       // On peut joindre le nom de la voiture pour l'affichage
        LocalDate dateDebut,
        LocalDate dateFin,
        Double prixTotal,
        String statut,
        String extras

) {}
