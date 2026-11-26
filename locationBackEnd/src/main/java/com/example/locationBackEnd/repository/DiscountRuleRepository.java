package com.example.locationBackEnd.repository;

import com.example.locationBackEnd.entity.DiscountRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscountRuleRepository extends JpaRepository<DiscountRule, Long> {
    List<DiscountRule> findByKindOrderByThresholdAsc(DiscountRule.Kind kind);
}
