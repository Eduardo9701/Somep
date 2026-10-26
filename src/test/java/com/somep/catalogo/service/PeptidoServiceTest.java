package com.somep.catalogo.service;

import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.exception.ResourceNotFoundException;
import com.somep.catalogo.model.Peptido;
import com.somep.catalogo.repository.PeptidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PeptidoServiceTest {

    @Mock
    private PeptidoRepository peptidoRepository;

    @InjectMocks
    private PeptidoServiceImpl peptidoService;

    private Peptido p1;
    private Peptido p2;

    @BeforeEach
    void setUp() {
        p1 = new Peptido(
                "Tirzepatida",
                "Agonista de los receptores GIP y GLP-1",
                "Medicamento peptídico",
                "Medicamento peptídico",
                "Regulación de glucosa",
                "Diabetes tipo 2",
                "Requiere supervisión médica",
                "FDA",
                "/assets/images/tirzepatida.jpeg"
        );
        p1.setId(1L);

        p2 = new Peptido(
                "Vitamina B12",
                "Un nutriente esencial",
                "Vitamina y nutriente",
                "Vitamina hidrosoluble",
                "Eritropoyesis",
                "Anemia",
                "Corregir deficiencia",
                "NIH",
                "/assets/images/vitamina-b12.jpeg"
        );
        p2.setId(2L);
    }

    @Test
    @DisplayName("Debe listar todos los compuestos cuando no se envían filtros")
    void testListarTodos() {
        when(peptidoRepository.findAll()).thenReturn(Arrays.asList(p1, p2));

        List<PeptidoResponse> resultado = peptidoService.listarPeptidos(null, null);

        assertEquals(2, resultado.size());
        assertEquals(2L, resultado.get(0).getId()); // Más reciente primero (id 2L)
        assertEquals(1L, resultado.get(1).getId());
        verify(peptidoRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe filtrar compuestos por categoría")
    void testFiltrarPorCategoria() {
        when(peptidoRepository.findByCategoriaIgnoreCase("Medicamento peptídico"))
                .thenReturn(List.of(p1));

        List<PeptidoResponse> resultado = peptidoService.listarPeptidos("Medicamento peptídico", "");

        assertEquals(1, resultado.size());
        assertEquals("Tirzepatida", resultado.get(0).getNombre());
        verify(peptidoRepository, times(1)).findByCategoriaIgnoreCase("Medicamento peptídico");
    }

    @Test
    @DisplayName("Debe buscar compuestos por texto")
    void testBuscarPorTexto() {
        when(peptidoRepository.buscarTexto("nutriente")).thenReturn(List.of(p2));

        List<PeptidoResponse> resultado = peptidoService.listarPeptidos(null, "nutriente");

        assertEquals(1, resultado.size());
        assertEquals("Vitamina B12", resultado.get(0).getNombre());
        verify(peptidoRepository, times(1)).buscarTexto("nutriente");
    }

    @Test
    @DisplayName("Debe combinar filtro de categoría y búsqueda de texto")
    void testCombinarFiltroYBusqueda() {
        when(peptidoRepository.buscarPorCategoriaYTexto("Medicamento peptídico", "GIP"))
                .thenReturn(List.of(p1));

        List<PeptidoResponse> resultado = peptidoService.listarPeptidos("Medicamento peptídico", "GIP");

        assertEquals(1, resultado.size());
        assertEquals("Tirzepatida", resultado.get(0).getNombre());
        verify(peptidoRepository, times(1)).buscarPorCategoriaYTexto("Medicamento peptídico", "GIP");
    }

    @Test
    @DisplayName("Debe obtener un compuesto por su ID exitosamente")
    void testObtenerPorIdExitoso() {
        when(peptidoRepository.findById(1L)).thenReturn(Optional.of(p1));

        PeptidoResponse resultado = peptidoService.obtenerPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("Tirzepatida", resultado.getNombre());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el ID no existe")
    void testObtenerPorIdInexistente() {
        when(peptidoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> peptidoService.obtenerPorId(99L));
    }

    @Test
    @DisplayName("Debe devolver las categorías disponibles")
    void testObtenerCategorias() {
        when(peptidoRepository.findDistinctCategorias()).thenReturn(Arrays.asList("Coenzima", "Medicamento peptídico"));

        List<String> categorias = peptidoService.obtenerCategorias();

        assertEquals(2, categorias.size());
        assertTrue(categorias.contains("Coenzima"));
    }
}
