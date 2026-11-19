package com.somep.catalogo.controller;

import com.somep.catalogo.dto.CursoRequest;
import com.somep.catalogo.dto.CursoResponse;
import com.somep.catalogo.service.CursoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/cursos")
public class AdminCursoController {

    private final CursoService cursoService;

    public AdminCursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @GetMapping
    public ResponseEntity<List<CursoResponse>> listarCursos(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(cursoService.listarCursosAdmin(tipo, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            CursoResponse response = cursoService.obtenerPorId(id);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> crearCurso(@Valid @RequestBody CursoRequest request) {
        try {
            CursoResponse nuevoCurso = cursoService.crearCurso(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCurso);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al crear programa académico",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCurso(
            @PathVariable Long id,
            @Valid @RequestBody CursoRequest request) {
        try {
            CursoResponse actualizado = cursoService.actualizarCurso(id, request);
            return ResponseEntity.ok(actualizado);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al actualizar programa académico",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCurso(@PathVariable Long id) {
        try {
            cursoService.eliminarCurso(id);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Programa académico eliminado exitosamente",
                    "id", id
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar programa académico",
                    "mensaje", ex.getMessage()
            ));
        }
    }
}
