package com.example.locationBackEnd.controller;
import com.example.locationBackEnd.dto.ReservationRequest;
import com.example.locationBackEnd.dto.ReservationResponse;
import com.example.locationBackEnd.service.PricingService;
import com.example.locationBackEnd.service.ReservationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ReservationController {

    private final ReservationService reservationService;
    private final PricingService pricingService;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ReservationRequest request) {
        ReservationResponse savedRes = reservationService.create(request);

        Map<String, Object> response = new HashMap<>();
        response.put("data", savedRes);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponse>> getByUserId(@PathVariable String userId) {
        List<ReservationResponse> responses = reservationService.findByUserId(userId);
        return ResponseEntity.ok(responses);
    }


    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getById(@PathVariable Long id) { // Changé Long en String
        return ResponseEntity.ok(reservationService.findById(id));
    }


    @GetMapping
    public List<ReservationResponse> all() { return reservationService.findAll(); }

    @PutMapping("/{id}/status")
    public ReservationResponse status(@PathVariable Long id, @RequestParam String value) {
        return reservationService.updateStatus(id, value);
    }

    @GetMapping("/quote")
    public PricingService.Quote quote(
            @RequestParam String carId,
            @RequestParam(required = false) String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false) List<Long> optionIds) {
        return pricingService.quote(carId, userId, debut, fin, optionIds);
    }

    @GetMapping("/loyalty/{userId}")
    public PricingService.Loyalty loyalty(@PathVariable String userId) {
        return pricingService.loyalty(userId);
    }

    @PutMapping("/{id}/cancel")
    public ReservationResponse cancel(@PathVariable Long id, @RequestParam String userId) {
        return reservationService.cancel(id, userId);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { // Changé Long en String
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}