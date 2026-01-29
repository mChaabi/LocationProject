package com.example.locationBackEnd.repository;

import com.example.locationBackEnd.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    // Trouver tous les messages envoyés par un email spécifique (utile pour l'admin)
    List<Contact> findByEmail(String email);

    // Trouver les messages par sujet pour filtrer les demandes
    List<Contact> findBySujetContainingIgnoreCase(String sujet);
}