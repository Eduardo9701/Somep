package com.somep.catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PeptidoRequest {

    @NotBlank(message = "El nombre del compuesto es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder los 150 caracteres")
    private String nombre;

    @NotBlank(message = "El subtítulo descriptivo es obligatorio")
    @Size(max = 250, message = "El subtítulo no puede exceder los 250 caracteres")
    private String subtitulo;

    @NotBlank(message = "La categoría o clasificación es obligatoria")
    @Size(max = 100, message = "La categoría no puede exceder los 100 caracteres")
    private String categoria;

    @NotBlank(message = "La definición '¿Qué es?' es obligatoria")
    private String queEs;

    @NotBlank(message = "El campo '¿Qué hace o qué se estudia?' es obligatorio")
    private String queHaceOEstudia;

    private String usoMedico;

    @NotBlank(message = "El mensaje o advertencia científica clave es obligatorio")
    private String clave;

    private String fuente;

    @Size(max = 300, message = "La URL de la imagen no puede exceder los 300 caracteres")
    private String imagenUrl;

    public PeptidoRequest() {
    }

    public PeptidoRequest(String nombre, String subtitulo, String categoria, String queEs,
                          String queHaceOEstudia, String usoMedico, String clave, String fuente, String imagenUrl) {
        this.nombre = nombre;
        this.subtitulo = subtitulo;
        this.categoria = categoria;
        this.queEs = queEs;
        this.queHaceOEstudia = queHaceOEstudia;
        this.usoMedico = usoMedico;
        this.clave = clave;
        this.fuente = fuente;
        this.imagenUrl = imagenUrl;
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
}
