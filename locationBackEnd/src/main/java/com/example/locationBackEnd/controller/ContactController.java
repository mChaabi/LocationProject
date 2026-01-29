package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.dto.ContactRequestDTO;
import com.example.locationBackEnd.entity.Contact;
import com.example.locationBackEnd.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ContactRequestDTO dto) {
        // Appeler le service et récupérer l'objet sauvegardé
        Contact savedContact = contactService.createMessage(dto);
        // Préparer la réponse JSON
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Votre message a été envoyé avec succès !");
        response.put("data", savedContact); // Affichera l'ID, nomComplet, email, sujet, message, dateEnvoi

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
