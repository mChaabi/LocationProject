package com.example.locationBackEnd.repository;
import com.example.locationBackEnd.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> { // Change Long par String ici
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByCarId(String carId);
    boolean existsByCarIdAndStatut(String carId, String statut);

    @Query("""
  select count(r) > 0 from Reservation r
  where r.carId = :carId and r.statut <> 'annulee'
    and r.dateDebut <= :fin and r.dateFin >= :debut""")
    boolean existsOverlap(String carId, LocalDate debut, LocalDate fin);

    long countByUserIdAndStatut(String userId, String statut);
}
