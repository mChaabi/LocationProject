package com.example.locationBackEnd.service;

import com.example.locationBackEnd.dto.CarDTO;
import com.example.locationBackEnd.entity.Car;
import com.example.locationBackEnd.mapper.CarMapper;
import com.example.locationBackEnd.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;

    // 1. Trouver toutes les voitures
    public List<CarDTO> findAll() {
        return carRepository.findAll()
                .stream()
                .map(carMapper::toDTO)
                .collect(Collectors.toList());
    }

    // 2. Créer une seule voiture
    public CarDTO create(CarDTO carDTO) {
        Car car = carMapper.toEntity(carDTO);
        Car savedCar = carRepository.save(car);
        return carMapper.toDTO(savedCar);
    }

    // 3. Supprimer une voiture
    public void delete(String id) {
        if (!carRepository.existsById(id)) {
            throw new RuntimeException("Voiture non trouvée avec l'id : " + id);
        }
        carRepository.deleteById(id);
    }

    // 4. Poster beaucoup de voitures d'un coup
    @Transactional // Important : si une voiture échoue, rien n'est enregistré
    public List<CarDTO> saveAll(List<CarDTO> carDTOs) {
        List<Car> cars = carDTOs.stream()
                .map(carMapper::toEntity)
                .collect(Collectors.toList());

        List<Car> savedCars = carRepository.saveAll(cars);

        return savedCars.stream()
                .map(carMapper::toDTO)
                .collect(Collectors.toList());
    }
}
