package com.somep.catalogo.controller;

import com.somep.catalogo.dto.AdminStatsResponse;
import com.somep.catalogo.dto.PeptidoRequest;
import com.somep.catalogo.dto.PeptidoResponse;
import com.somep.catalogo.service.PeptidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/peptidos")
public class AdminPeptidoController {

    private final PeptidoService peptidoService;

    public AdminPeptidoController(PeptidoService peptidoService) {
        this.peptidoService = peptidoService;
    }

    @GetMapping
    public ResponseEntity<List<PeptidoResponse>> listarPeptidos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(peptidoService.listarPeptidos(categoria, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            PeptidoResponse response = peptidoService.obtenerPorId(id);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> crearPeptido(@Valid @RequestBody PeptidoRequest request) {
        try {
            PeptidoResponse nuevoPeptido = peptidoService.crearPeptido(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPeptido);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "Registro duplicado",
                    "mensaje", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al crear compuesto",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPeptido(
            @PathVariable Long id,
            @Valid @RequestBody PeptidoRequest request) {
        try {
            PeptidoResponse actualizado = peptidoService.actualizarPeptido(id, request);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "No encontrado o conflicto",
                    "mensaje", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al actualizar compuesto",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPeptido(@PathVariable Long id) {
        try {
            peptidoService.eliminarPeptido(id);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Compuesto eliminado exitosamente",
                    "id", id
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "No encontrado",
                    "mensaje", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error al eliminar compuesto",
                    "mensaje", ex.getMessage()
            ));
        }
    }

    @PostMapping("/upload-imagen")
    public ResponseEntity<?> subirImagen(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Archivo vacío",
                    "mensaje", "Por favor seleccione un archivo de imagen válido."
            ));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Formato inválido",
                    "mensaje", "El archivo debe ser una imagen válida (JPG, PNG, WEBP, SVG o GIF)."
            ));
        }

        try {
            Path uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "imagen.jpg");
            String extension = "";
            int dotIndex = originalName.lastIndexOf(".");
            if (dotIndex > 0) {
                extension = originalName.substring(dotIndex).toLowerCase();
            } else {
                extension = ".jpg";
            }

            String uniqueFilename = UUID.randomUUID().toString().substring(0, 8) + "_" + System.currentTimeMillis() + extension;
            Path destinationFile = uploadDir.resolve(uniqueFilename).normalize();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String publicUrl = "/uploads/" + uniqueFilename;

            return ResponseEntity.ok(Map.of(
                    "url", publicUrl,
                    "nombre", originalName,
                    "mensaje", "Imagen cargada correctamente."
            ));

        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Error de almacenamiento",
                    "mensaje", "No fue posible guardar la imagen en el servidor: " + ex.getMessage()
            ));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> obtenerEstadisticas() {
        return ResponseEntity.ok(peptidoService.obtenerEstadisticas());
    }
}
