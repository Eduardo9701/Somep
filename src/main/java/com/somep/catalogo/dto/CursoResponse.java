package com.somep.catalogo.dto;

import com.somep.catalogo.model.Curso;
import java.time.LocalDateTime;

public class CursoResponse {

    private Long id;
    private String tipo;
    private String badgeTipo;
    private String estado;
    private String titulo;
    private String meta1;
    private String meta2;
    private String descripcion;
    private String acreditacion;
    private String enlaceWhatsapp;
    private String textoBoton;
    private String imagenUrl;
    private Integer orden;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    public CursoResponse() {
    }

    public static CursoResponse fromEntity(Curso c) {
        if (c == null) {
            return null;
        }
        CursoResponse dto = new CursoResponse();
        dto.setId(c.getId());
        dto.setTipo(c.getTipo());
        dto.setBadgeTipo(c.getBadgeTipo());
        dto.setEstado(c.getEstado());
        dto.setTitulo(c.getTitulo());
        dto.setMeta1(c.getMeta1());
        dto.setMeta2(c.getMeta2());
        dto.setDescripcion(c.getDescripcion());
        dto.setAcreditacion(c.getAcreditacion());
        dto.setEnlaceWhatsapp(c.getEnlaceWhatsapp());
        dto.setTextoBoton(c.getTextoBoton());
        dto.setImagenUrl(c.getImagenUrl());
        dto.setOrden(c.getOrden());
        dto.setActivo(c.getActivo());
        dto.setFechaCreacion(c.getFechaCreacion());
        dto.setFechaActualizacion(c.getFechaActualizacion());
        return dto;
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
