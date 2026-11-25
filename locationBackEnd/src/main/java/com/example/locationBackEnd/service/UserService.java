package com.example.locationBackEnd.service;

import com.example.locationBackEnd.dto.UserRequestDTO;
import com.example.locationBackEnd.dto.UserResponseDTO;
import com.example.locationBackEnd.entity.User;
import com.example.locationBackEnd.mapper.UserMapper;
import com.example.locationBackEnd.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public UserResponseDTO create(UserRequestDTO dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("Cet email est déjà utilisé.");
        }

        User user = userMapper.toEntity(dto); // or: User user = new User();
        user.setEmail(dto.email());
        user.setPassword(passwordEncoder.encode(dto.password())); // check your entity/DTO field names
        user.setRole("client"); // or Role enum if your User.role is an Enum

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    // --- FIND ALL ---
    public List<UserResponseDTO> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    // --- FIND BY ID ---
    public UserResponseDTO findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return userMapper.toResponse(user);
    }

    // --- DELETE ---
    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Impossible de supprimer : Utilisateur inexistant");
        }
        userRepository.deleteById(id);
    }
}
