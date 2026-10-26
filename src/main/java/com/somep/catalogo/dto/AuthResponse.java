package com.somep.catalogo.dto;

public class AuthResponse {

    private boolean authenticated;
    private String username;
    private String nombreCompleto;
    private String email;
    private String rol;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(boolean authenticated, String message, String username, String nombreCompleto, String rol) {
        this.authenticated = authenticated;
        this.message = message;
        this.username = username;
        this.nombreCompleto = nombreCompleto;
        this.rol = rol;
    }

    public AuthResponse(boolean authenticated, String username, String nombreCompleto, String email, String rol, String message) {
        this.authenticated = authenticated;
        this.username = username;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.rol = rol;
        this.message = message;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public boolean isAutenticado() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRol() {
        return rol;
    }

    public String getRole() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getMessage() {
        return message;
    }

    public String getMensaje() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
