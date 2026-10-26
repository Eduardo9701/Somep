package com.somep.catalogo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.somep.catalogo.dto.AdminStatsResponse;
import com.somep.catalogo.dto.PeptidoRequest;
import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.service.PeptidoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminPeptidoController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminPeptidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PeptidoService peptidoService;

    @Test
    @DisplayName("GET /api/admin/peptidos/stats retorna estadísticas del catálogo")
    void testObtenerEstadisticas() throws Exception {
        AdminStatsResponse stats = new AdminStatsResponse(11L, 5L, null);
        given(peptidoService.obtenerEstadisticas()).willReturn(stats);

        mockMvc.perform(get("/api/admin/peptidos/stats")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCompuestos", is(11)))
                .andExpect(jsonPath("$.totalCategorias", is(5)));
    }

    @Test
    @DisplayName("POST /api/admin/peptidos crea un nuevo compuesto con 201 Created")
    void testCrearPeptido() throws Exception {
        PeptidoRequest request = new PeptidoRequest();
        request.setNombre("BPC-157");
        request.setSubtitulo("Péptido gástrico sintético");
        request.setCategoria("Péptido en investigación");
        request.setQueEs("Secuencia de 15 aminoácidos");
        request.setQueHaceOEstudia("Reparación tisular");
        request.setClave("No aprobado para consumo humano");

        PeptidoResponse nuevo = new PeptidoResponse();
        nuevo.setId(15L);
        nuevo.setNombre("BPC-157");
        nuevo.setSubtitulo("Péptido gástrico sintético");
        nuevo.setCategoria("Péptido en investigación");

        given(peptidoService.crearPeptido(any(PeptidoRequest.class))).willReturn(nuevo);

        mockMvc.perform(post("/api/admin/peptidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(15)))
                .andExpect(jsonPath("$.nombre", is("BPC-157")));
    }

    @Test
    @DisplayName("PUT /api/admin/peptidos/{id} actualiza un compuesto existente con 200 OK")
    void testActualizarPeptido() throws Exception {
        PeptidoRequest request = new PeptidoRequest();
        request.setNombre("BPC-157 Modificado");
        request.setSubtitulo("Péptido gástrico sintético");
        request.setCategoria("Péptido en investigación");
        request.setQueEs("Secuencia de 15 aminoácidos");
        request.setQueHaceOEstudia("Reparación tisular y colágeno");
        request.setClave("No aprobado");

        PeptidoResponse actualizado = new PeptidoResponse();
        actualizado.setId(15L);
        actualizado.setNombre("BPC-157 Modificado");

        given(peptidoService.actualizarPeptido(eq(15L), any(PeptidoRequest.class))).willReturn(actualizado);

        mockMvc.perform(put("/api/admin/peptidos/15")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(15)))
                .andExpect(jsonPath("$.nombre", is("BPC-157 Modificado")));
    }

    @Test
    @DisplayName("DELETE /api/admin/peptidos/{id} elimina un compuesto con 200 OK")
    void testEliminarPeptido() throws Exception {
        doNothing().when(peptidoService).eliminarPeptido(15L);

        mockMvc.perform(delete("/api/admin/peptidos/15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(15)))
                .andExpect(jsonPath("$.mensaje", containsString("exitosamente")));
    }

    @Test
    @DisplayName("POST /api/admin/peptidos/upload-imagen debe subir imagen y retornar 200 OK con la URL")
    void testSubirImagen() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-peptido.png",
                "image/png",
                "contenido simulado de imagen".getBytes()
        );

        mockMvc.perform(multipart("/api/admin/peptidos/upload-imagen").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url", startsWith("/uploads/")))
                .andExpect(jsonPath("$.nombre", is("test-peptido.png")));
    }
}
