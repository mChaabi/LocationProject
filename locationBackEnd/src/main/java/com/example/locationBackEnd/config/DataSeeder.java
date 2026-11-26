package com.example.locationBackEnd.config;

import com.example.locationBackEnd.entity.*;
import com.example.locationBackEnd.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final CarRepository cars;
    private final UserRepository users;
    private final BCryptPasswordEncoder encoder;
    private final ExtraOptionRepository extras;
    private final DiscountRuleRepository rules;
    private final PromoCodeRepository promos;

    @Override
    public void run(String... args) {
        if (users.count() == 0) {
            users.save(User.builder().nom("Admin").prenom("Agence").email("admin@autodrive.com")
                    .password(encoder.encode("admin123")).telephone("0600000000").role("admin").build());
        }
        if (cars.count() == 0) {
            cars.saveAll(List.of(
                    car("Chevrolet", "Camaro SS", "automatique", "Bleu", 2022, 120,
                            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800"),
                    car("BMW", "Série 3", "automatique", "Noir", 2023, 95, ""),
                    car("Renault", "Clio 5", "manuelle", "Rouge", 2022, 40, ""),
                    car("Tesla", "Model 3", "automatique", "Blanc", 2024, 110, "")));
        }

        if (!users.existsByEmail("admin@autodrive.com")) {
            users.save(User.builder().nom("Admin").prenom("Agence").email("admin@autodrive.com")
                    .password(encoder.encode("admin123")).telephone("0600000000").role("admin").build());
        }
        if (extras.count() == 0) {
            extras.saveAll(List.of(
                    ExtraOption.builder().icon("...").name("Siège bébé").price(4).build(),
                    ExtraOption.builder().icon("...").name("2e conducteur").price(8).build(),
                    ExtraOption.builder().icon("...").name("Assurance premium").price(10).build(),
                    ExtraOption.builder().icon("...").name("Wi-Fi 4G").price(3).build()
            ));
        }

        if (rules.count() == 0) {
            rules.saveAll(List.of(
                    rule(DiscountRule.Kind.LOYALTY, "Bronze", 1, 5), rule(DiscountRule.Kind.LOYALTY, "Silver", 3, 10),
                    rule(DiscountRule.Kind.LOYALTY, "Gold", 6, 15),
                    rule(DiscountRule.Kind.DURATION, "Long séjour", 7, 5), rule(DiscountRule.Kind.DURATION, "Très long séjour", 14, 10)));
        }
        if (promos.count() == 0) promos.save(PromoCode.builder().code("BIENVENUE10").percent(10).build());


    }

    private Car car(String marque, String modele, String boite, String couleur, int annee, double prix, String img) {
        return Car.builder().marque(marque).modele(modele).typeBoite(boite).couleur(couleur)
                .annee(annee).prixJournalier(prix).disponible(true).imageUrL(img).build();
    }

    private DiscountRule rule(DiscountRule.Kind k, String name, int threshold, int rate) {
        return DiscountRule.builder().kind(k).name(name).threshold(threshold).rate(rate).build();
    }
}