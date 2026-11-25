package com.example.locationBackEnd.service;

// Correction des imports vers ton package réel
import com.example.locationBackEnd.dto.ReservationRequest;
import com.example.locationBackEnd.dto.ReservationResponse;
import com.example.locationBackEnd.entity.Car;
import com.example.locationBackEnd.entity.ExtraOption;
import com.example.locationBackEnd.mapper.ReservationMapper;
import com.example.locationBackEnd.entity.Reservation; // Changé de .model à .entity
import com.example.locationBackEnd.repository.CarRepository;
import com.example.locationBackEnd.repository.ExtraOptionRepository;
import com.example.locationBackEnd.repository.ReservationRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final CarRepository carRepository;
    private final ExtraOptionRepository extraRepository;

    @Transactional
    public ReservationResponse create(ReservationRequest request) {
        Car car = carRepository.findById(request.carId())
                .orElseThrow(() -> new EntityNotFoundException("Voiture introuvable"));
        if (!car.isDisponible() || reservationRepository.existsOverlap(car.getId(), request.dateDebut(), request.dateFin()))
            throw new IllegalArgumentException("Voiture non disponible pour ces dates");

        List<ExtraOption> chosen = request.optionIds() == null ? List.of()
                : extraRepository.findAllById(request.optionIds());
        long jours = Math.max(1, ChronoUnit.DAYS.between(request.dateDebut(), request.dateFin()));
        double perDay = car.getPrixJournalier() + chosen.stream().mapToDouble(ExtraOption::getPrice).sum();

        Reservation r = reservationMapper.toEntity(request);
        r.setPrixTotal(jours * perDay);
        r.setExtras(chosen.stream().map(ExtraOption::getName).collect(Collectors.joining(", ")));
        return toResp(reservationRepository.save(r));
    }

    // --- FIND ALL (Par Utilisateur) ---
    public List<ReservationResponse> findByUserId(String userId) {
        return reservationRepository.findByUserId(userId)
                .stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    // --- FIND ONE ---
    public ReservationResponse findById(Long id) { // Changé Long en String si tu utilises UUID
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
        return reservationMapper.toResponse(reservation);
    }

    public List<ReservationResponse> findAll() {
        return reservationRepository.findAll().stream().map(this::toResp).toList();
    }

    @Transactional
    public ReservationResponse updateStatus(Long id, String statut) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée"));
        r.setStatut(statut);
        return toResp(reservationRepository.save(r));
    }

    private ReservationResponse toResp(Reservation r) {
        String name = carRepository.findById(r.getCarId())
                .map(c -> c.getMarque() + " " + c.getModele()).orElse("—");
        ReservationResponse m = reservationMapper.toResponse(r);
        return new ReservationResponse(m.id(), name, m.dateDebut(), m.dateFin(), m.prixTotal(), m.statut(), m.extras());
    }

    // --- DELETE ---
    @Transactional
    public void delete(Long id) { // Changé Long en String pour correspondre à tes UUID
        if (!reservationRepository.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : ID inconnu");
        }
        reservationRepository.deleteById(id);
    }
}