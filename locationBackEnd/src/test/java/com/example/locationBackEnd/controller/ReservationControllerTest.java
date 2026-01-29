package com.example.locationBackEnd.controller;

import com.example.locationBackEnd.dto.ReservationRequest;
import com.example.locationBackEnd.dto.ReservationResponse;
import com.example.locationBackEnd.service.ReservationService;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class) // Utilise Mockito pur sans charger Spring
class ReservationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReservationService reservationService;

    @InjectMocks
    private ReservationController reservationController;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .readTree(new JavaTimeModule()); // Nécessaire pour gérer LocalDate

    @BeforeEach
    void setUp() {
        // Initialise MockMvc manuellement avec le contrôleur et ses mocks
        mockMvc = MockMvcBuilders.standaloneSetup(reservationController).build();
    }

    @Test
    void shouldCreateReservationWithMockito() throws Exception {
        // GIVEN
        ReservationRequest request = new ReservationRequest(
                1L, "user789", LocalDate.now(), LocalDate.now().plusDays(5)
        );

        ReservationResponse response = new ReservationResponse(
                1L, 1L, LocalDate.now(), LocalDate.now().plusDays(5), 250.0, "en_attente"
        );

        // Utilisation de Mockito "pur"
        when(reservationService.create(any(ReservationRequest.class))).thenReturn(response);

        // WHEN & THEN
        mockMvc.perform(post("/reservations/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.prixTotal").value(250.0));
    }
}