package com.somep.catalogo.service;

import com.somep.catalogo.dto.CursoRequest;
import com.somep.catalogo.dto.CursoResponse;
import com.somep.catalogo.exception.ResourceNotFoundException;
import com.somep.catalogo.model.Curso;
import com.somep.catalogo.repository.CursoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CursoServiceImpl implements CursoService {

    private final CursoRepository cursoRepository;

    public CursoServiceImpl(CursoRepository cursoRepository) {
        this.cursoRepository = cursoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursoResponse> listarCursosPublicos(String tipo, String buscar) {
        String tipoNorm = (tipo != null && !tipo.trim().isEmpty() && !tipo.equalsIgnoreCase("all")) ? tipo.trim() : null;
        String buscarNorm = (buscar != null && !buscar.trim().isEmpty()) ? buscar.trim() : null;

        List<Curso> cursos = cursoRepository.buscarPublicos(tipoNorm, buscarNorm);
        return cursos.stream()
                .map(CursoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursoResponse> listarCursosAdmin(String tipo, String buscar) {
        String tipoNorm = (tipo != null && !tipo.trim().isEmpty() && !tipo.equalsIgnoreCase("all")) ? tipo.trim() : null;
        String buscarNorm = (buscar != null && !buscar.trim().isEmpty()) ? buscar.trim() : null;

        List<Curso> cursos = cursoRepository.buscarAdmin(tipoNorm, buscarNorm);
        return cursos.stream()
                .map(CursoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CursoResponse obtenerPorId(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programa académico no encontrado con ID: " + id));
        return CursoResponse.fromEntity(curso);
    }

    @Override
    @Transactional
    public CursoResponse crearCurso(CursoRequest request) {
        Curso curso = new Curso(
                request.getTipo() != null ? request.getTipo().trim().toLowerCase() : "curso",
                request.getBadgeTipo() != null ? request.getBadgeTipo().trim() : "Curso con Constancia",
                request.getEstado() != null ? request.getEstado().trim() : "Inscripciones Abiertas",
                request.getTitulo() != null ? request.getTitulo().trim() : "",
                request.getMeta1() != null ? request.getMeta1().trim() : "",
                request.getMeta2() != null ? request.getMeta2().trim() : "",
                request.getDescripcion() != null ? request.getDescripcion().trim() : "",
                request.getAcreditacion() != null ? request.getAcreditacion().trim() : "",
                request.getEnlaceWhatsapp() != null ? request.getEnlaceWhatsapp().trim() : "https://wa.me/525579247494",
                request.getTextoBoton() != null && !request.getTextoBoton().trim().isEmpty() ? request.getTextoBoton().trim() : "Solicitar Programa e Inscripción",
                request.getImagenUrl() != null ? request.getImagenUrl().trim() : "",
                request.getOrden() != null ? request.getOrden() : 1,
                request.getActivo() != null ? request.getActivo() : true
        );

        Curso guardado = cursoRepository.save(curso);
        return CursoResponse.fromEntity(guardado);
    }

    @Override
    @Transactional
    public CursoResponse actualizarCurso(Long id, CursoRequest request) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programa académico no encontrado con ID: " + id));

        if (request.getTipo() != null) {
            curso.setTipo(request.getTipo().trim().toLowerCase());
        }
        if (request.getBadgeTipo() != null) {
            curso.setBadgeTipo(request.getBadgeTipo().trim());
        }
        if (request.getEstado() != null) {
            curso.setEstado(request.getEstado().trim());
        }
        if (request.getTitulo() != null) {
            curso.setTitulo(request.getTitulo().trim());
        }
        if (request.getMeta1() != null) {
            curso.setMeta1(request.getMeta1().trim());
        }
        if (request.getMeta2() != null) {
            curso.setMeta2(request.getMeta2().trim());
        }
        if (request.getDescripcion() != null) {
            curso.setDescripcion(request.getDescripcion().trim());
        }
        if (request.getAcreditacion() != null) {
            curso.setAcreditacion(request.getAcreditacion().trim());
        }
        if (request.getEnlaceWhatsapp() != null) {
            curso.setEnlaceWhatsapp(request.getEnlaceWhatsapp().trim());
        }
        if (request.getTextoBoton() != null) {
            curso.setTextoBoton(request.getTextoBoton().trim());
        }
        if (request.getImagenUrl() != null) {
            curso.setImagenUrl(request.getImagenUrl().trim());
        }
        if (request.getOrden() != null) {
            curso.setOrden(request.getOrden());
        }
        if (request.getActivo() != null) {
            curso.setActivo(request.getActivo());
        }

        Curso actualizado = cursoRepository.save(curso);
        return CursoResponse.fromEntity(actualizado);
    }

    @Override
    @Transactional
    public void eliminarCurso(Long id) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programa académico no encontrado con ID: " + id));
        cursoRepository.delete(curso);
    }
}
