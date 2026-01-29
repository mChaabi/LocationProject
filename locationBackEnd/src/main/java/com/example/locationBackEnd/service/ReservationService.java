package com.example.locationBackEnd.service;

// Correction des imports vers ton package réel
import com.example.locationBackEnd.dto.ReservationRequest;
import com.example.locationBackEnd.dto.ReservationResponse;
import com.example.locationBackEnd.mapper.ReservationMapper;
import com.example.locationBackEnd.entity.Reservation; // Changé de .model à .entity
import com.example.locationBackEnd.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;

    // --- CREATE ---
    @Transactional
    public ReservationResponse create(ReservationRequest request) {
        Reservation reservation = reservationMapper.toEntity(request);

        // Logique de calcul du prix total
        long jours = ChronoUnit.DAYS.between(request.dateDebut(), request.dateFin());
        if (jours <= 0) jours = 1; // Minimum 1 jour de location

        // Note: Idéalement, récupère le prix réel via carRepository.findById(request.carId())
        double prixJournalierSimule = 50.0;
        reservation.setPrixTotal(jours * prixJournalierSimule);

        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toResponse(saved);
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

    // --- DELETE ---
    @Transactional
    public void delete(Long id) { // Changé Long en String pour correspondre à tes UUID
        if (!reservationRepository.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : ID inconnu");
        }
        reservationRepository.deleteById(id);
    }
}