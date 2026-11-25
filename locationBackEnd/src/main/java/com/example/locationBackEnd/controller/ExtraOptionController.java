package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.entity.ExtraOption;
import com.example.locationBackEnd.repository.ExtraOptionRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/options") @RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ExtraOptionController {
    private final ExtraOptionRepository repo;

    @GetMapping
    public List<ExtraOption> all() { return repo.findAll(); }
    @PostMapping
    public ExtraOption create(@Valid @RequestBody ExtraOption o) { o.setId(null); return repo.save(o); }
    @PutMapping("/{id}") public ExtraOption update(@PathVariable Long id, @Valid @RequestBody ExtraOption o) { o.setId(id); return repo.save(o); }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { repo.deleteById(id); }
}