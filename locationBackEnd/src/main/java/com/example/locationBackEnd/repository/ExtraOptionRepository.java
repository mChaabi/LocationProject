package com.example.locationBackEnd.repository;

import com.example.locationBackEnd.entity.ExtraOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExtraOptionRepository extends JpaRepository<ExtraOption, Long> {
    Optional<ExtraOption> findByName(String name);
}