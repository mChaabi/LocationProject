package com.example.locationBackEnd.mapper;
import com.example.locationBackEnd.dto.ReservationRequest;
import com.example.locationBackEnd.dto.ReservationResponse;
import com.example.locationBackEnd.entity.Reservation;
import com.example.locationBackEnd.repository.ReservationRepository;

import lombok.Data;
import org.springframework.stereotype.Component;


@Data
@Component
public class ReservationMapper {

    // Transforme le DTO reçu d'Angular en Entité pour la BDD
    public Reservation toEntity(ReservationRequest request) {
        return Reservation.builder()
                .carId(request.carId())
                .userId(request.userId())
                .dateDebut(request.dateDebut())
                .dateFin(request.dateFin())
                .statut("en_attente") // Statut par défaut à la création
                .build();
    }

    // Transforme l'Entité de la BDD en DTO pour renvoyer au Front
    public ReservationResponse toResponse(Reservation entity) {
        return new ReservationResponse(entity.getId(), entity.getCarId(), null, entity.getDateDebut(),
                entity.getDateFin(), entity.getPrixTotal(), entity.getRemise(), entity.getStatut(), entity.getExtras());
    }
}