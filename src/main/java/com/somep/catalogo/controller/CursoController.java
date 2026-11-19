package com.somep.catalogo.controller;

import com.somep.catalogo.dto.CursoResponse;
import com.somep.catalogo.service.CursoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    /**
     * Consulta pública de cursos y programas académicos activos.
     * Soporta filtro por tipo (curso, seminario, conferencia) y búsqueda por texto.
     */
    @GetMapping
    public ResponseEntity<List<CursoResponse>> listarCursos(
            @RequestParam(name = "tipo", required = false) String tipo,
            @RequestParam(name = "buscar", required = false) String buscar) {
        List<CursoResponse> resultados = cursoService.listarCursosPublicos(tipo, buscar);
        return ResponseEntity.ok(resultados);
    }

    /**
     * Obtiene el detalle de un programa académico por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CursoResponse> obtenerPorId(@PathVariable("id") Long id) {
        CursoResponse curso = cursoService.obtenerPorId(id);
        return ResponseEntity.ok(curso);
    }
}
