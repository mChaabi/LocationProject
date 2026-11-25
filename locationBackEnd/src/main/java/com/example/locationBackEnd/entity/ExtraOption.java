package com.example.locationBackEnd.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "extra_options")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @NotBlank
    private String name;
    private String icon;
    @Positive
    private double price;   // € per day
}