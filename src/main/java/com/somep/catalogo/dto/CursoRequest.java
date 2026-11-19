package com.somep.catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CursoRequest {

    @NotBlank(message = "El tipo de programa es obligatorio")
    @Size(max = 50, message = "El tipo no puede exceder los 50 caracteres")
    private String tipo;

    @NotBlank(message = "La etiqueta del tipo es obligatoria")
    @Size(max = 100, message = "La etiqueta del tipo no puede exceder los 100 caracteres")
    private String badgeTipo;

    @NotBlank(message = "El estado de convocatoria es obligatorio")
    @Size(max = 80, message = "El estado no puede exceder los 80 caracteres")
    private String estado;

    @NotBlank(message = "El título del programa es obligatorio")
    @Size(max = 250, message = "El título no puede exceder los 250 caracteres")
    private String titulo;

    @Size(max = 150, message = "El metadato 1 no puede exceder los 150 caracteres")
    private String meta1;

    @Size(max = 150, message = "El metadato 2 no puede exceder los 150 caracteres")
    private String meta2;

    @NotBlank(message = "La descripción del programa es obligatoria")
    private String descripcion;

    private String acreditacion;

    @Size(max = 500, message = "El enlace de WhatsApp no puede exceder los 500 caracteres")
    private String enlaceWhatsapp;

    @Size(max = 100, message = "El texto del botón no puede exceder los 100 caracteres")
    private String textoBoton;

    @Size(max = 350, message = "La URL de la imagen no puede exceder los 350 caracteres")
    private String imagenUrl;

    private Integer orden;
    private Boolean activo;

    public CursoRequest() {
    }

    public CursoRequest(String tipo, String badgeTipo, String estado, String titulo, String meta1, String meta2,
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
        this.orden = orden;
        this.activo = activo;
    }

    // Getters y Setters
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
}
