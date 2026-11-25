package com.example.locationBackEnd.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record ReservationRequest(@NotBlank String carId, @NotBlank String userId,
                                 @NotNull LocalDate dateDebut, @NotNull LocalDate dateFin, List<Long> optionIds) {}