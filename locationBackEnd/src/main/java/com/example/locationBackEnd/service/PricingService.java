package com.example.locationBackEnd.service;

import com.example.locationBackEnd.entity.Car;
import com.example.locationBackEnd.entity.DiscountRule;
import com.example.locationBackEnd.entity.ExtraOption;
import com.example.locationBackEnd.entity.PromoCode;
import com.example.locationBackEnd.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PricingService {

    private static final int MAX_RATE = 30;
    private static final String CONFIRMED = "confirmee";

    private final CarRepository carRepository;
    private final ExtraOptionRepository extraRepository;
    private final ReservationRepository reservationRepository;
    private final DiscountRuleRepository ruleRepository;
    private final PromoCodeRepository promoRepository;

    public record Tier(String name, int minRentals, int rate) {}
    public record Loyalty(String tier, int rate, long rentals, String nextTier, int nextRate, long toNext, int progress) {}
    public record Rules(List<DiscountRule> loyalty, List<DiscountRule> duration, int maxRate) {}
    public record PromoCheck(String status, int rate, String code) {}
    public record Quote(long days, double carPerDay, double optionsPerDay, double subtotal,
                        String tier, int loyaltyRate, int durationRate,
                        String promoCode, int promoRate, String promoStatus,
                        int totalRate, double discount, double total,
                        long rentals, String nextTier, long rentalsToNext) {}

    public Rules rules() {
        return new Rules(ruleRepository.findByKindOrderByThresholdAsc(DiscountRule.Kind.LOYALTY),
                ruleRepository.findByKindOrderByThresholdAsc(DiscountRule.Kind.DURATION), MAX_RATE);
    }

    private List<Tier> tiers() {
        List<Tier> tiers = new ArrayList<>(List.of(new Tier("Nouveau", 0, 0)));
        ruleRepository.findByKindOrderByThresholdAsc(DiscountRule.Kind.LOYALTY)
                .forEach(r -> tiers.add(new Tier(r.getName(), r.getThreshold(), r.getRate())));
        return tiers;
    }

    public Loyalty loyalty(String userId) {
        List<Tier> tiers = tiers();
        long done = userId == null ? 0 : reservationRepository.countByUserIdAndStatut(userId, CONFIRMED);
        Tier current = tiers.stream().filter(t -> t.minRentals() <= done).reduce((a, b) -> b).orElseThrow();
        Tier next = tiers.stream().filter(t -> t.minRentals() > done).findFirst().orElse(null);
        int progress = next == null ? 100
                : (int) ((done - current.minRentals()) * 100 / (next.minRentals() - current.minRentals()));
        return new Loyalty(current.name(), current.rate(), done,
                next == null ? null : next.name(), next == null ? 0 : next.rate(),
                next == null ? 0 : next.minRentals() - done, progress);
    }

    public PromoCheck checkPromo(String code) {
        if (code == null || code.isBlank()) return new PromoCheck("NONE", 0, null);
        PromoCode p = promoRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
        if (p == null) return new PromoCheck("INVALID", 0, null);
        if (!p.isActive()) return new PromoCheck("INACTIVE", 0, null);
        if (p.getExpiresAt() != null && p.getExpiresAt().isBefore(LocalDate.now())) return new PromoCheck("EXPIRED", 0, null);
        if (p.getMaxUses() != null && p.getUses() >= p.getMaxUses()) return new PromoCheck("EXHAUSTED", 0, null);
        return new PromoCheck("OK", p.getPercent(), p.getCode());
    }

    public Quote quote(String carId, String userId, LocalDate debut, LocalDate fin,
                       List<Long> optionIds, String promoCode) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new EntityNotFoundException("Voiture introuvable"));
        long days = ChronoUnit.DAYS.between(debut, fin);
        if (days < 1) throw new IllegalArgumentException("La date de fin doit être après la date de début");

        double optionsPerDay = optionIds == null ? 0
                : extraRepository.findAllById(optionIds).stream().mapToDouble(ExtraOption::getPrice).sum();
        double subtotal = days * (car.getPrixJournalier() + optionsPerDay);

        Loyalty loyalty = loyalty(userId);
        int durationRate = ruleRepository.findByKindOrderByThresholdAsc(DiscountRule.Kind.DURATION).stream()
                .filter(r -> r.getThreshold() <= days).mapToInt(DiscountRule::getRate).max().orElse(0);
        PromoCheck promo = checkPromo(promoCode);

        int totalRate = Math.min(loyalty.rate() + durationRate + promo.rate(), MAX_RATE);
        double discount = round(subtotal * totalRate / 100.0);

        return new Quote(days, car.getPrixJournalier(), optionsPerDay, round(subtotal),
                loyalty.tier(), loyalty.rate(), durationRate,
                promo.code(), promo.rate(), promo.status(),
                totalRate, discount, round(subtotal - discount),
                loyalty.rentals(), loyalty.nextTier(), loyalty.toNext());
    }

    @Transactional
    public void consumePromo(String code) {
        promoRepository.findByCodeIgnoreCase(code).ifPresent(p -> { p.setUses(p.getUses() + 1); promoRepository.save(p); });
    }

    @Transactional
    public void releasePromo(String code) {
        promoRepository.findByCodeIgnoreCase(code)
                .ifPresent(p -> { p.setUses(Math.max(0, p.getUses() - 1)); promoRepository.save(p); });
    }

    private static double round(double v) { return Math.round(v * 100) / 100.0; }
}