package com.example.locationBackEnd.mapper;

import com.example.locationBackEnd.dto.CarDTO;
import com.example.locationBackEnd.entity.Car;
import org.springframework.stereotype.Service;

@Service
public class CarMapper {

    public CarDTO toDTO(Car car) {
        if (car == null) return null;

        return new CarDTO(
                car.getId(),
                car.getMarque(),
                car.getModele(),
                car.getImageUrL(),       // Respect du 'L' majuscule
                car.getLogoMarqueUrL(),
                car.getPrixJournalier(),
                car.isDisponible(),
                car.getTypeBoite(),
                car.getCouleur(),
                car.getAnnee()
        );
    }

    public Car toEntity(CarDTO dto) {
        if (dto == null) return null;

        Car car = new Car();
        car.setId(dto.id());
        car.setMarque(dto.marque());
        car.setModele(dto.modele());
        car.setImageUrL(dto.imageUrL());
        car.setLogoMarqueUrL(dto.logoMarqueUrL());
        car.setPrixJournalier(dto.prixJournalier());
        car.setDisponible(dto.disponible());
        car.setTypeBoite(dto.typeBoite());
        car.setCouleur(dto.couleur());
        car.setAnnee(dto.annee());

        return car;
    }
}