package com.example.locationBackEnd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "discount_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountRule {
    public enum Kind { LOYALTY, DURATION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Enumerated(EnumType.STRING) @NotNull
    private Kind kind;
    @NotBlank
    private String name;                    // Bronze, Silver… / "Long séjour"
    @Min(1) private int threshold;                    // LOYALTY: rentals · DURATION: days
    @Min(1) @Max(50) private int rate;                // percent
}