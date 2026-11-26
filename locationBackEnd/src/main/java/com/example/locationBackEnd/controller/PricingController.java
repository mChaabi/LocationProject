package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.entity.DiscountRule;
import com.example.locationBackEnd.repository.DiscountRuleRepository;
import com.example.locationBackEnd.service.PricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pricing") @RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PricingController {
    private final PricingService pricing;
    private final DiscountRuleRepository rules;

    @GetMapping("/rules") public PricingService.Rules all() { return pricing.rules(); }
    @PostMapping("/rules") public DiscountRule create(@Valid @RequestBody DiscountRule r) { r.setId(null); return rules.save(r); }
    @PutMapping("/rules/{id}") public DiscountRule update(@PathVariable Long id, @Valid @RequestBody DiscountRule r) { r.setId(id); return rules.save(r); }
    @DeleteMapping("/rules/{id}") public void delete(@PathVariable Long id) { rules.deleteById(id); }
}
