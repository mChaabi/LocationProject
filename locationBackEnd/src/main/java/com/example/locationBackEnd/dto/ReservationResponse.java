package com.example.locationBackEnd.dto;

import java.time.LocalDate;

public record ReservationResponse(Long id, String carName, String carImage, LocalDate dateDebut,
                                  LocalDate dateFin, Double prixTotal, Double remise, String statut, String extras,String promoCode) {}
