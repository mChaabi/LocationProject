package com.example.locationBackEnd.repository;
import com.example.locationBackEnd.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, String> {

    // Recherche toutes les voitures par marque (Ex: Toyota)
    List<Car> findByMarque(String marque);

    // Recherche toutes les voitures disponibles
    List<Car> findByDisponibleTrue();

    // Recherche par type de boîte (automatique/manuelle)
    List<Car> findByTypeBoite(String typeBoite);
}