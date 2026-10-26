package com.somep.catalogo.service;

import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.exception.ResourceNotFoundException;
import com.somep.catalogo.model.Peptido;
import com.somep.catalogo.repository.PeptidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PeptidoServiceImpl implements PeptidoService {

    private final PeptidoRepository peptidoRepository;

    public PeptidoServiceImpl(PeptidoRepository peptidoRepository) {
        this.peptidoRepository = peptidoRepository;
    }

    @Override
    public List<PeptidoResponse> listarPeptidos(String categoria, String buscar) {
        boolean tieneCategoria = categoria != null && !categoria.trim().isEmpty() && !categoria.equalsIgnoreCase("todos");
        boolean tieneBuscar = buscar != null && !buscar.trim().isEmpty();

        List<Peptido> entidades;

        if (tieneCategoria && tieneBuscar) {
            entidades = peptidoRepository.buscarPorCategoriaYTexto(categoria.trim(), buscar.trim());
        } else if (tieneCategoria) {
            entidades = peptidoRepository.findByCategoriaIgnoreCase(categoria.trim());
        } else if (tieneBuscar) {
            entidades = peptidoRepository.buscarTexto(buscar.trim());
        } else {
            entidades = peptidoRepository.findAll();
        }

        return entidades.stream()
                .map(PeptidoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PeptidoResponse obtenerPorId(Long id) {
        Peptido peptido = peptidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el compuesto con identificador: " + id));
        return PeptidoResponse.fromEntity(peptido);
    }

    @Override
    public List<String> obtenerCategorias() {
        return peptidoRepository.findDistinctCategorias();
    }

    @Override
    @Transactional
    public PeptidoResponse guardar(Peptido peptido) {
        Peptido guardado = peptidoRepository.save(peptido);
        return PeptidoResponse.fromEntity(guardado);
    }
}
