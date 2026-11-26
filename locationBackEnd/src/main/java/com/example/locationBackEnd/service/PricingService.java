package com.example.locationBackEnd.service;

import com.example.locationBackEnd.entity.Car;
import com.example.locationBackEnd.entity.ExtraOption;
import com.example.locationBackEnd.repository.CarRepository;
import com.example.locationBackEnd.repository.ExtraOptionRepository;
import com.example.locationBackEnd.repository.ReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingService {

    private static final int MAX_RATE = 20;
    private static final String CONFIRMED = "confirmee";
    private static final List<Tier> TIERS = List.of(
            new Tier("Nouveau", 0, 0), new Tier("Bronze", 1, 5),
            new Tier("Silver", 3, 10), new Tier("Gold", 6, 15));

    private final CarRepository carRepository;
    private final ExtraOptionRepository extraRepository;
    private final ReservationRepository reservationRepository;

    public record Tier(String name, int minRentals, int rate) {}
    public record Loyalty(String tier, int rate, long rentals, String nextTier, int nextRate, long toNext, int progress) {}
    public record Quote(long days, double carPerDay, double optionsPerDay, double subtotal,
                        String tier, int loyaltyRate, int durationRate, int totalRate,
                        double discount, double total, long rentals, String nextTier, long rentalsToNext) {}

    public Loyalty loyalty(String userId) {
        long done = userId == null ? 0 : reservationRepository.countByUserIdAndStatut(userId, CONFIRMED);
        Tier current = TIERS.stream().filter(t -> t.minRentals() <= done).reduce((a, b) -> b).orElseThrow();
        Tier next = TIERS.stream().filter(t -> t.minRentals() > done).findFirst().orElse(null);
        int progress = next == null ? 100
                : (int) ((done - current.minRentals()) * 100 / (next.minRentals() - current.minRentals()));
        return new Loyalty(current.name(), current.rate(), done,
                next == null ? null : next.name(), next == null ? 0 : next.rate(),
                next == null ? 0 : next.minRentals() - done, progress);
    }

    public Quote quote(String carId, String userId, LocalDate debut, LocalDate fin, List<Long> optionIds) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Voiture introuvable"));
        long days = ChronoUnit.DAYS.between(debut, fin);
        if (days < 1) throw new IllegalArgumentException("La date de fin doit être après la date de début");

        double optionsPerDay = optionIds == null ? 0
                : extraRepository.findAllById(optionIds).stream().mapToDouble(ExtraOption::getPrice).sum();
        double subtotal = days * (car.getPrixJournalier() + optionsPerDay);

        Loyalty loyalty = loyalty(userId);
        int durationRate = days >= 14 ? 10 : days >= 7 ? 5 : 0;
        int totalRate = Math.min(loyalty.rate() + durationRate, MAX_RATE);
        double discount = round(subtotal * totalRate / 100.0);

        return new Quote(days, car.getPrixJournalier(), optionsPerDay, round(subtotal), loyalty.tier(),
                loyalty.rate(), durationRate, totalRate, discount, round(subtotal - discount),
                loyalty.rentals(), loyalty.nextTier(), loyalty.toNext());
    }

    private static double round(double v) { return Math.round(v * 100) / 100.0; }
}
