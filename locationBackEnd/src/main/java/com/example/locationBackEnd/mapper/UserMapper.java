package com.example.locationBackEnd.mapper;

import com.example.locationBackEnd.dto.UserRequestDTO;
import com.example.locationBackEnd.dto.UserResponseDTO;
import com.example.locationBackEnd.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequestDTO dto) {
        if (dto == null) return null;

        return User.builder()
                .nom(dto.nom())
                .prenom(dto.prenom())
                .email(dto.email())
                .password(dto.password()) // Sera hashé dans le Service
                .telephone(dto.telephone())
                .role(dto.role())
                .build();
    }

    /**
     * Transforme l'Entité User en DTO de réponse (pour Angular).
     * On ne renvoie JAMAIS le mot de passe ici.
     */
    public UserResponseDTO toResponse(User entity) {
        if (entity == null) return null;

        return new UserResponseDTO(
                entity.getId(),
                entity.getNom(),
                entity.getPrenom(),
                entity.getEmail(),
                entity.getTelephone(),
                entity.getRole(),
                entity.getDateInscription()
        );
    }
}
