package com.somep.catalogo.service;

import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.model.Peptido;

import java.util.List;

public interface PeptidoService {
    List<PeptidoResponse> listarPeptidos(String categoria, String buscar);
    PeptidoResponse obtenerPorId(Long id);
    List<String> obtenerCategorias();
    PeptidoResponse guardar(Peptido peptido);
}
