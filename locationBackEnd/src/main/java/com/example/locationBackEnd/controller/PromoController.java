package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.entity.PromoCode;
import com.example.locationBackEnd.repository.PromoCodeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/promos") @RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PromoController {
    private final PromoCodeRepository repo;

    @GetMapping
    public List<PromoCode> all() { return repo.findAll(); }

    @PostMapping
    public PromoCode create(@Valid @RequestBody PromoCode p) {
        p.setId(null); p.setCode(p.getCode().trim().toUpperCase()); p.setUses(0);
        return repo.save(p);
    }
    @PutMapping("/{id}") public PromoCode update(@PathVariable Long id, @Valid @RequestBody PromoCode p) {
        p.setId(id); p.setCode(p.getCode().trim().toUpperCase());
        p.setUses(repo.findById(id).map(PromoCode::getUses).orElse(0));   // never trust uses from the client
        return repo.save(p);
    }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
