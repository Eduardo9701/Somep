package com.somep.catalogo.controller;

import com.somep.catalogo.dto.AdminStatsResponse;
import com.somep.catalogo.dto.PeptidoRequest;
import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.service.PeptidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/peptidos")
public class AdminPeptidoController {

    private final PeptidoService peptidoService;

    public AdminPeptidoController(PeptidoService peptidoService) {
        this.peptidoService = peptidoService;
    }

    @GetMapping
    public ResponseEntity<List<PeptidoResponse>> listarPeptidos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(peptidoService.listarPeptidos(categoria, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            PeptidoResponse response = peptidoService.obtenerPorId(id);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> crearPeptido(@Valid @RequestBody PeptidoRequest request) {
        try {
            PeptidoResponse nuevoPeptido = peptidoService.crearPeptido(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPeptido);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "Registro duplicado",
                    "mensaje", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al crear compuesto",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPeptido(
            @PathVariable Long id,
            @Valid @RequestBody PeptidoRequest request) {
        try {
            PeptidoResponse actualizado = peptidoService.actualizarPeptido(id, request);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "No encontrado o conflicto",
                    "mensaje", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al actualizar compuesto",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPeptido(@PathVariable Long id) {
        try {
            peptidoService.eliminarPeptido(id);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Compuesto eliminado exitosamente",
                    "id", id
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "No encontrado",
                    "mensaje", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar compuesto",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> obtenerEstadisticas() {
        return ResponseEntity.ok(peptidoService.obtenerEstadisticas());
    }
}
