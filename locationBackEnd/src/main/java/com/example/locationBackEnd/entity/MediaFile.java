package com.example.locationBackEnd.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaFile {
    public enum Owner { CAR, USER, RESERVATION }
    public enum Kind { PHOTO, VIDEO, LICENSE, ID_CARD }
    public enum Review { PENDING, VERIFIED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) private String id;
    @Enumerated(EnumType.STRING) private Owner ownerType;
    private String ownerId;
    @Enumerated(EnumType.STRING) private Kind kind;
    @Enumerated(EnumType.STRING) @Builder.Default private Review review = Review.PENDING;
    private String originalName;
    private String contentType;
    private long size;
    private String storedName;       // random name on disk, never the user's file name
    private LocalDateTime createdAt;

    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); }
}