package com.somep.catalogo.dto;

import java.time.LocalDateTime;

public class AdminStatsResponse {

    private long totalCompuestos;
    private long totalCategorias;
    private LocalDateTime ultimaActualizacion;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(long totalCompuestos, long totalCategorias, LocalDateTime ultimaActualizacion) {
        this.totalCompuestos = totalCompuestos;
        this.totalCategorias = totalCategorias;
        this.ultimaActualizacion = ultimaActualizacion;
    }

    public long getTotalCompuestos() {
        return totalCompuestos;
    }

    public void setTotalCompuestos(long totalCompuestos) {
        this.totalCompuestos = totalCompuestos;
    }

    public long getTotalCategorias() {
        return totalCategorias;
    }

    public void setTotalCategorias(long totalCategorias) {
        this.totalCategorias = totalCategorias;
    }

    public LocalDateTime getUltimaActualizacion() {
        return ultimaActualizacion;
    }

    public void setUltimaActualizacion(LocalDateTime ultimaActualizacion) {
        this.ultimaActualizacion = ultimaActualizacion;
    }
}
