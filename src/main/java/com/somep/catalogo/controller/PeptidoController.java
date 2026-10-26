package com.somep.catalogo.controller;

import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.service.PeptidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peptidos")
@CrossOrigin(origins = "*") // Permite integración local y pruebas multiplataforma
public class PeptidoController {

    private final PeptidoService peptidoService;

    public PeptidoController(PeptidoService peptidoService) {
        this.peptidoService = peptidoService;
    }

    /**
     * Consulta el catálogo general con filtros opcionales por categoría y búsqueda de texto.
     * Ejemplo:
     * GET /api/peptidos
     * GET /api/peptidos?categoria=Coenzima
     * GET /api/peptidos?buscar=insulina
     * GET /api/peptidos?categoria=Medicamento peptídico&buscar=glucosa
     */
    @GetMapping
    public ResponseEntity<List<PeptidoResponse>> listarPeptidos(
            @RequestParam(name = "categoria", required = false) String categoria,
            @RequestParam(name = "buscar", required = false) String buscar) {
        List<PeptidoResponse> resultados = peptidoService.listarPeptidos(categoria, buscar);
        return ResponseEntity.ok(resultados);
    }

    /**
     * Obtiene los detalles científicos completos de un compuesto por su ID.
     * Ejemplo:
     * GET /api/peptidos/3
     */
    @GetMapping("/{id}")
    public ResponseEntity<PeptidoResponse> obtenerPorId(@PathVariable("id") Long id) {
        PeptidoResponse response = peptidoService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene el listado de categorías disponibles en el catálogo para generar filtros dinámicos.
     * Ejemplo:
     * GET /api/peptidos/categorias
     */
    @GetMapping("/categorias")
    public ResponseEntity<List<String>> listarCategorias() {
        List<String> categorias = peptidoService.obtenerCategorias();
        return ResponseEntity.ok(categorias);
    }
}
