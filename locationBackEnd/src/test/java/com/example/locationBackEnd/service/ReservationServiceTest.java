package com.example.locationBackEnd.service;

import com.example.locationBackEnd.dto.ReservationRequest;
import com.example.locationBackEnd.dto.ReservationResponse;
import com.example.locationBackEnd.entity.Reservation;
import com.example.locationBackEnd.mapper.ReservationMapper;
import com.example.locationBackEnd.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ReservationMapper reservationMapper;

    @InjectMocks
    private ReservationService reservationService;

    private ReservationRequest request;
    private Reservation entity;

    @BeforeEach
    void setUp() {
        request = new ReservationRequest(
                "CAR-1", "USER-1",
                LocalDate.now(),
                LocalDate.now().plusDays(2) // 2 jours de différence
        );

        entity = new Reservation();
        entity.setId(1L);
        entity.setCarId("CAR-1");
    }

    @Test
    void shouldCalculatePriceCorrectlyAndSave() {
        // GIVEN
        when(reservationMapper.toEntity(request)).thenReturn(entity);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(entity);
        when(reservationMapper.toResponse(any(Reservation.class))).thenReturn(
                new ReservationResponse(1L, "CAR-1", request.dateDebut(), request.dateFin(), 100.0, "en_attente")
        );

        // WHEN
        ReservationResponse response = reservationService.create(request);

        // THEN
        assertNotNull(response);
        // On vérifie que le prix total a été setté dans l'entité avant la sauvegarde
        // 2 jours * 50.0 = 100.0
        assertEquals(100.0, entity.getPrixTotal());
        verify(reservationRepository, times(1)).save(entity);
    }

    @Test
    void shouldThrowExceptionWhenReservationNotFound() {
        // GIVEN
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.findById(99L);
        });

        assertEquals("Réservation non trouvée", exception.getMessage());
    }

    @Test
    void shouldDeleteSuccessfully() {
        // GIVEN
        when(reservationRepository.existsById(1L)).thenReturn(true);

        // WHEN
        reservationService.delete(1L);

        // THEN
        verify(reservationRepository).deleteById(1L);
    }
}