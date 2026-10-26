package com.somep.catalogo.dto;

import com.somep.catalogo.model.Peptido;
import java.time.LocalDateTime;

/**
 * DTO para la transferencia de datos hacia la API REST del cliente.
 */
public class PeptidoResponse {

    private Long id;
    private String nombre;
    private String subtitulo;
    private String categoria;
    private String queEs;
    private String queHaceOEstudia;
    private String usoMedico;
    private String clave;
    private String fuente;
    private String imagenUrl;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public PeptidoResponse() {
    }

    public static PeptidoResponse fromEntity(Peptido p) {
        if (p == null) {
            return null;
        }
        PeptidoResponse dto = new PeptidoResponse();
        dto.setId(p.getId());
        dto.setNombre(p.getNombre());
        dto.setSubtitulo(p.getSubtitulo());
        dto.setCategoria(p.getCategoria());
        dto.setQueEs(p.getQueEs());
        dto.setQueHaceOEstudia(p.getQueHaceOEstudia());
        dto.setUsoMedico(p.getUsoMedico());
        dto.setClave(p.getClave());
        dto.setFuente(p.getFuente());
        dto.setImagenUrl(p.getImagenUrl());
        dto.setFechaCreacion(p.getFechaCreacion());
        dto.setFechaActualizacion(p.getFechaActualizacion());
        return dto;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getSubtitulo() {
        return subtitulo;
    }

    public void setSubtitulo(String subtitulo) {
        this.subtitulo = subtitulo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getQueEs() {
        return queEs;
    }

    public void setQueEs(String queEs) {
        this.queEs = queEs;
    }

    public String getQueHaceOEstudia() {
        return queHaceOEstudia;
    }

    public void setQueHaceOEstudia(String queHaceOEstudia) {
        this.queHaceOEstudia = queHaceOEstudia;
    }

    public String getUsoMedico() {
        return usoMedico;
    }

    public void setUsoMedico(String usoMedico) {
        this.usoMedico = usoMedico;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public String getFuente() {
        return fuente;
    }

    public void setFuente(String fuente) {
        this.fuente = fuente;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
