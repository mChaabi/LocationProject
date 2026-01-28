package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.dto.CarDTO;
import com.example.locationBackEnd.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cars") // L'URL finale sera http://localhost:8080/api/cars
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200") // Autorise Angular à appeler l'API
public class CarController {

    private final CarService carService;

    // 1. Récupérer toutes les voitures
    @GetMapping
    public ResponseEntity<List<CarDTO>> getAllCars() {
        return ResponseEntity.ok(carService.findAll());
    }

    // 2. Créer une seule voiture
    @PostMapping("/add")
    public ResponseEntity<CarDTO> createCar(@Valid @RequestBody CarDTO carDTO) {
        return new ResponseEntity<>(carService.create(carDTO), HttpStatus.CREATED);
    }

    // 3. Poster beaucoup de voitures d'un coup (Bulk)
    @PostMapping("/bulk")
    public ResponseEntity<List<CarDTO>> createMultipleCars(@Valid @RequestBody List<CarDTO> carDTOs) {
        return new ResponseEntity<>(carService.saveAll(carDTOs), HttpStatus.CREATED);
    }

    // 4. Supprimer une voiture
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable String id) {
        carService.delete(id);
        return ResponseEntity.noContent().build();
    }
}