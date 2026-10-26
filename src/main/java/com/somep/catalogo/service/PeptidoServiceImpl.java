package com.somep.catalogo.service;

import com.somep.catalogo.dto.AdminStatsResponse;
import com.somep.catalogo.dto.PeptidoRequest;
import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.exception.ResourceNotFoundException;
import com.somep.catalogo.model.Peptido;
import com.somep.catalogo.repository.PeptidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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

    @Override
    @Transactional
    public PeptidoResponse crearPeptido(PeptidoRequest request) {
        String nombreLimpio = request.getNombre().trim();
        Optional<Peptido> existente = peptidoRepository.findByNombreIgnoreCase(nombreLimpio);
        if (existente.isPresent()) {
            throw new IllegalArgumentException("Ya existe un compuesto registrado con el nombre: " + nombreLimpio);
        }

        Peptido peptido = new Peptido(
                nombreLimpio,
                request.getSubtitulo().trim(),
                request.getCategoria().trim(),
                request.getQueEs().trim(),
                request.getQueHaceOEstudia().trim(),
                request.getUsoMedico() != null ? request.getUsoMedico().trim() : null,
                request.getClave().trim(),
                request.getFuente() != null ? request.getFuente().trim() : null,
                request.getImagenUrl() != null && !request.getImagenUrl().trim().isEmpty() 
                        ? request.getImagenUrl().trim() : null
        );

        Peptido guardado = peptidoRepository.save(peptido);
        return PeptidoResponse.fromEntity(guardado);
    }

    @Override
    @Transactional
    public PeptidoResponse actualizarPeptido(Long id, PeptidoRequest request) {
        Peptido peptido = peptidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el compuesto con identificador: " + id));

        String nombreLimpio = request.getNombre().trim();
        Optional<Peptido> existente = peptidoRepository.findByNombreIgnoreCase(nombreLimpio);
        if (existente.isPresent() && !existente.get().getId().equals(id)) {
            throw new IllegalArgumentException("Ya existe otro compuesto registrado con el nombre: " + nombreLimpio);
        }

        peptido.setNombre(nombreLimpio);
        peptido.setSubtitulo(request.getSubtitulo().trim());
        peptido.setCategoria(request.getCategoria().trim());
        peptido.setQueEs(request.getQueEs().trim());
        peptido.setQueHaceOEstudia(request.getQueHaceOEstudia().trim());
        peptido.setUsoMedico(request.getUsoMedico() != null ? request.getUsoMedico().trim() : null);
        peptido.setClave(request.getClave().trim());
        peptido.setFuente(request.getFuente() != null ? request.getFuente().trim() : null);
        if (request.getImagenUrl() != null && !request.getImagenUrl().trim().isEmpty()) {
            peptido.setImagenUrl(request.getImagenUrl().trim());
        }

        Peptido actualizado = peptidoRepository.save(peptido);
        return PeptidoResponse.fromEntity(actualizado);
    }

    @Override
    @Transactional
    public void eliminarPeptido(Long id) {
        Peptido peptido = peptidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el compuesto con identificador: " + id));
        peptidoRepository.delete(peptido);
    }

    @Override
    public AdminStatsResponse obtenerEstadisticas() {
        long totalCompuestos = peptidoRepository.count();
        long totalCategorias = peptidoRepository.findDistinctCategorias().size();
        LocalDateTime ultimaActualizacion = peptidoRepository.findMaxFechaActualizacion()
                .orElse(LocalDateTime.now());

        return new AdminStatsResponse(totalCompuestos, totalCategorias, ultimaActualizacion);
    }
}
