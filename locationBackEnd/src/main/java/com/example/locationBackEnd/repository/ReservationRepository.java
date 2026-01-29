package com.example.locationBackEnd.repository;
import com.example.locationBackEnd.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> { // Change Long par String ici
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByCarId(String carId);
    boolean existsByCarIdAndStatut(String carId, String statut);
}
