package com.somep.catalogo.controller;

import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.exception.GlobalExceptionHandler;
import com.somep.catalogo.exception.ResourceNotFoundException;
import com.somep.catalogo.service.PeptidoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PeptidoController.class)
@Import(GlobalExceptionHandler.class)
class PeptidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PeptidoService peptidoService;

    @Test
    @DisplayName("GET /api/peptidos debe retornar lista de compuestos en JSON con 200 OK")
    void testListarPeptidos() throws Exception {
        PeptidoResponse dto1 = new PeptidoResponse();
        dto1.setId(1L);
        dto1.setNombre("Tirzepatida");
        dto1.setSubtitulo("Agonista de los receptores GIP y GLP-1");
        dto1.setCategoria("Medicamento peptídico");

        given(peptidoService.listarPeptidos(null, null)).willReturn(List.of(dto1));

        mockMvc.perform(get("/api/peptidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .characterEncoding("UTF-8"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre", is("Tirzepatida")))
                .andExpect(jsonPath("$[0].categoria", is("Medicamento peptídico")));
    }

    @Test
    @DisplayName("GET /api/peptidos/{id} debe retornar 200 OK con el compuesto si existe")
    void testObtenerPorIdExitoso() throws Exception {
        PeptidoResponse dto = new PeptidoResponse();
        dto.setId(3L);
        dto.setNombre("Retatrutide");
        dto.setSubtitulo("Molécula en investigación clínica");
        dto.setCategoria("Medicamento en investigación");
        dto.setClave("Continúa en investigación clínica.");

        given(peptidoService.obtenerPorId(3L)).willReturn(dto);

        mockMvc.perform(get("/api/peptidos/3")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(3)))
                .andExpect(jsonPath("$.nombre", is("Retatrutide")))
                .andExpect(jsonPath("$.clave", containsString("investigación clínica")));
    }

    @Test
    @DisplayName("GET /api/peptidos/{id} debe retornar 404 Not Found cuando el ID no existe")
    void testObtenerPorIdNoEncontrado() throws Exception {
        given(peptidoService.obtenerPorId(999L))
                .willThrow(new ResourceNotFoundException("No se encontró el compuesto con identificador: 999"));

        mockMvc.perform(get("/api/peptidos/999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("999")));
    }

    @Test
    @DisplayName("GET /api/peptidos/categorias debe retornar la lista de categorías")
    void testListarCategorias() throws Exception {
        given(peptidoService.obtenerCategorias()).willReturn(Arrays.asList("Coenzima", "Medicamento peptídico", "Tripéptido"));

        mockMvc.perform(get("/api/peptidos/categorias")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0]", is("Coenzima")));
    }
}
