package com.somep.catalogo.controller;

import com.somep.catalogo.dto.AuthResponse;
import com.somep.catalogo.dto.LoginRequest;
import com.somep.catalogo.model.Usuario;
import com.somep.catalogo.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Invalidar sesión anterior si existiese para prevenir fijación de sesión
            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }

            // Persistir la nueva sesión en el request
            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

            Usuario usuario = (Usuario) authentication.getPrincipal();
            usuario.setUltimoAcceso(LocalDateTime.now());
            usuarioRepository.save(usuario);

            AuthResponse authResponse = new AuthResponse(
                    true,
                    "Inicio de sesión exitoso",
                    usuario.getUsername(),
                    usuario.getNombreCompleto(),
                    usuario.getRole()
            );

            return ResponseEntity.ok(authResponse);

        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "Credenciales incorrectas",
                    "mensaje", "Usuario o contraseña inválidos."
            ));
        } catch (DisabledException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Cuenta deshabilitada",
                    "mensaje", "La cuenta de usuario se encuentra inactiva."
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error de autenticación",
                    "mensaje", "Ocurrió un error inesperado al procesar el inicio de sesión."
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioActual(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "autenticado", false,
                    "mensaje", "No hay una sesión activa."
            ));
        }

        Usuario usuario = (Usuario) authentication.getPrincipal();
        AuthResponse authResponse = new AuthResponse(
                true,
                "Usuario autenticado",
                usuario.getUsername(),
                usuario.getNombreCompleto(),
                usuario.getRole()
        );

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "no-cache, no-store, max-age=0, must-revalidate")
                .header(org.springframework.http.HttpHeaders.PRAGMA, "no-cache")
                .header(org.springframework.http.HttpHeaders.EXPIRES, "0")
                .body(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("JSESSIONID", "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of(
                "mensaje", "Sesión cerrada exitosamente",
                "autenticado", false
        ));
    }

    @GetMapping("/csrf")
    public ResponseEntity<?> obtenerCsrfToken(HttpServletRequest request, HttpServletResponse response) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            return ResponseEntity.ok(Map.of(
                    "headerName", csrfToken.getHeaderName(),
                    "parameterName", csrfToken.getParameterName(),
                    "token", csrfToken.getToken()
            ));
        }
        return ResponseEntity.ok(Map.of("mensaje", "CSRF no habilitado o generado"));
    }
}
