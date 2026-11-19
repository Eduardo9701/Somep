package com.somep.catalogo.service;

import com.somep.catalogo.dto.CursoRequest;
import com.somep.catalogo.dto.CursoResponse;

import java.util.List;

public interface CursoService {

    List<CursoResponse> listarCursosPublicos(String tipo, String buscar);

    List<CursoResponse> listarCursosAdmin(String tipo, String buscar);

    CursoResponse obtenerPorId(Long id);

    CursoResponse crearCurso(CursoRequest request);

    CursoResponse actualizarCurso(Long id, CursoRequest request);

    void eliminarCurso(Long id);
}
