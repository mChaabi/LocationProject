package com.example.locationBackEnd.mapper;

import com.example.locationBackEnd.dto.ContactRequestDTO;
import com.example.locationBackEnd.entity.Contact;
import org.springframework.stereotype.Component;

@Component
public class ContactMapper {

    public Contact toEntity(ContactRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        return Contact.builder()
                .nomComplet(dto.nomComplet())
                .email(dto.email())
                .sujet(dto.sujet())
                .message(dto.message())
                // La dateEnvoi sera gérée par le @PrePersist de l'entité
                .build();
    }
}