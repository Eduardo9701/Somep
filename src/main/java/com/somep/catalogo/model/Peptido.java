package com.somep.catalogo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Entidad JPA representativa de un compuesto, molécula o péptido
 * del catálogo científico y glosario educativo de SOMEP.
 */
@Entity
@Table(name = "peptidos", indexes = {
    @Index(name = "idx_peptido_nombre", columnList = "nombre"),
    @Index(name = "idx_peptido_categoria", columnList = "categoria")
})
public class Peptido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del compuesto es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder los 150 caracteres")
    @Column(nullable = false, length = 150)
    private String nombre;

    @NotBlank(message = "El subtítulo descriptivo es obligatorio")
    @Size(max = 250, message = "El subtítulo no puede exceder los 250 caracteres")
    @Column(nullable = false, length = 250)
    private String subtitulo;

    @NotBlank(message = "La categoría o clasificación es obligatoria")
    @Size(max = 100, message = "La categoría no puede exceder los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String categoria;

    @NotBlank(message = "La definición '¿Qué es?' es obligatoria")
    @Column(name = "que_es", nullable = false, columnDefinition = "TEXT")
    private String queEs;

    @NotBlank(message = "El campo '¿Qué hace o qué se estudia?' es obligatorio")
    @Column(name = "que_hace_o_estudia", nullable = false, columnDefinition = "TEXT")
    private String queHaceOEstudia;

    @Column(name = "uso_medico", columnDefinition = "TEXT")
    private String usoMedico;

    @NotBlank(message = "El mensaje o advertencia científica clave es obligatorio")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String clave;

    @Column(columnDefinition = "TEXT")
    private String fuente;

    @Column(name = "imagen_url", length = 300)
    private String imagenUrl;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    public Peptido() {
    }

    public Peptido(String nombre, String subtitulo, String categoria, String queEs,
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

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
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
