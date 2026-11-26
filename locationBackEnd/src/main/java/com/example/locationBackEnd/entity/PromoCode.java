package com.example.locationBackEnd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "promo_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @NotBlank
    @Column(unique = true) private String code;
    @Min(1) @Max(50) private int percent;
    @Builder.Default private boolean active = true;
    private LocalDate expiresAt;       // optional
    private Integer maxUses;           // optional
    private int uses;
}
