package com.example.locationBackEnd.service;

import com.example.locationBackEnd.dto.ContactRequestDTO;
import com.example.locationBackEnd.entity.Contact;
import com.example.locationBackEnd.mapper.ContactMapper;
import com.example.locationBackEnd.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;

    @Transactional
    public Contact createMessage(ContactRequestDTO dto) { // Changer void en Contact
        // Transformation DTO -> Entity via le Mapper
        Contact contact = contactMapper.toEntity(dto);

        // Sauvegarde et retour de l'entité (avec l'ID et la date générés)
        return contactRepository.save(contact);
    }
}