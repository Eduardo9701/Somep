package com.somep.catalogo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Entidad JPA para cursos, diplomados, seminarios y conferencias
 * de la Academia y Formación Continua de SOMEP.
 */
@Entity
@Table(name = "cursos", indexes = {
    @Index(name = "idx_curso_tipo", columnList = "tipo"),
    @Index(name = "idx_curso_activo", columnList = "activo")
})
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El tipo de programa es obligatorio")
    @Size(max = 50, message = "El tipo no puede exceder los 50 caracteres")
    @Column(nullable = false, length = 50)
    private String tipo; // curso, diplomado, seminario, conferencia

    @NotBlank(message = "La etiqueta del tipo es obligatoria")
    @Size(max = 100, message = "La etiqueta del tipo no puede exceder los 100 caracteres")
    @Column(name = "badge_tipo", nullable = false, length = 100)
    private String badgeTipo; // ej. Curso con Constancia, Seminario Clínico, Simposio Nacional

    @NotBlank(message = "El estado de convocatoria es obligatorio")
    @Size(max = 80, message = "El estado no puede exceder los 80 caracteres")
    @Column(nullable = false, length = 80)
    private String estado; // ej. Inscripciones Abiertas, Próxima Edición, Convocatoria 2026

    @NotBlank(message = "El título del programa es obligatorio")
    @Size(max = 250, message = "El título no puede exceder los 250 caracteres")
    @Column(nullable = false, length = 250)
    private String titulo;

    @Column(name = "meta1", length = 150)
    private String meta1; // ej. 60 Horas Académicas

    @Column(name = "meta2", length = 150)
    private String meta2; // ej. Modalidad Online Asíncrona + Tutoría

    @NotBlank(message = "La descripción del programa es obligatoria")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(columnDefinition = "TEXT")
    private String acreditacion;

    @Column(name = "enlace_whatsapp", length = 500)
    private String enlaceWhatsapp;

    @Column(name = "texto_boton", length = 100)
    private String textoBoton; // ej. Solicitar Programa e Inscripción

    @Column(name = "imagen_url", length = 350)
    private String imagenUrl;

    @Column(nullable = false)
    private Integer orden = 1;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    public Curso() {
    }

    public Curso(String tipo, String badgeTipo, String estado, String titulo, String meta1, String meta2,
                 String descripcion, String acreditacion, String enlaceWhatsapp, String textoBoton,
                 String imagenUrl, Integer orden, Boolean activo) {
        this.tipo = tipo;
        this.badgeTipo = badgeTipo;
        this.estado = estado;
        this.titulo = titulo;
        this.meta1 = meta1;
        this.meta2 = meta2;
        this.descripcion = descripcion;
        this.acreditacion = acreditacion;
        this.enlaceWhatsapp = enlaceWhatsapp;
        this.textoBoton = textoBoton;
        this.imagenUrl = imagenUrl;
        this.orden = orden != null ? orden : 1;
        this.activo = activo != null ? activo : true;
    }

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
        if (this.orden == null) {
            this.orden = 1;
        }
        if (this.activo == null) {
            this.activo = true;
        }
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getBadgeTipo() {
        return badgeTipo;
    }

    public void setBadgeTipo(String badgeTipo) {
        this.badgeTipo = badgeTipo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMeta1() {
        return meta1;
    }

    public void setMeta1(String meta1) {
        this.meta1 = meta1;
    }

    public String getMeta2() {
        return meta2;
    }

    public void setMeta2(String meta2) {
        this.meta2 = meta2;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getAcreditacion() {
        return acreditacion;
    }

    public void setAcreditacion(String acreditacion) {
        this.acreditacion = acreditacion;
    }

    public String getEnlaceWhatsapp() {
        return enlaceWhatsapp;
    }

    public void setEnlaceWhatsapp(String enlaceWhatsapp) {
        this.enlaceWhatsapp = enlaceWhatsapp;
    }

    public String getTextoBoton() {
        return textoBoton;
    }

    public void setTextoBoton(String textoBoton) {
        this.textoBoton = textoBoton;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
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
