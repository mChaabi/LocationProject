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

import java.time.LocalDate;
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
    private final PricingService pricingService;

    @Transactional
    public ReservationResponse create(ReservationRequest req) {
        Car car = carRepository.findById(req.carId())
                .orElseThrow(() -> new EntityNotFoundException("Voiture introuvable"));
        if (!car.isDisponible() || reservationRepository.existsOverlap(car.getId(), req.dateDebut(), req.dateFin()))
            throw new IllegalArgumentException("Voiture non disponible pour ces dates");

        PricingService.Quote q = pricingService.quote(req.carId(), req.userId(), req.dateDebut(), req.dateFin(), req.optionIds());
        Reservation r = reservationMapper.toEntity(req);
        r.setPrixTotal(q.total());
        r.setRemise(q.discount());
        r.setExtras(optionNames(req.optionIds()));
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

    private String optionNames(List<Long> ids) {
        return ids == null ? "" : extraRepository.findAllById(ids).stream()
                .map(ExtraOption::getName).collect(Collectors.joining(", "));
    }

    private ReservationResponse toResp(Reservation r) {
        Car car = carRepository.findById(r.getCarId()).orElse(null);
        return new ReservationResponse(r.getId(),
                car == null ? "—" : car.getMarque() + " " + car.getModele(),
                car == null ? null : car.getImageUrL(),
                r.getDateDebut(), r.getDateFin(), r.getPrixTotal(),
                r.getRemise() == null ? 0.0 : r.getRemise(), r.getStatut(), r.getExtras());
    }

    @Transactional
    public ReservationResponse cancel(Long id, String userId) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Réservation non trouvée"));
        if (!r.getUserId().equals(userId)) throw new IllegalArgumentException("Cette réservation ne vous appartient pas");
        if ("annulee".equals(r.getStatut())) throw new IllegalArgumentException("Réservation déjà annulée");
        if (!r.getDateDebut().isAfter(LocalDate.now()))
            throw new IllegalArgumentException("Annulation impossible : la location a déjà commencé");
        r.setStatut("annulee");
        return toResp(reservationRepository.save(r));
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