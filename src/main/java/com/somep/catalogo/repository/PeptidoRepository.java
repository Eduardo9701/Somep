package com.somep.catalogo.repository;

import com.somep.catalogo.model.Peptido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeptidoRepository extends JpaRepository<Peptido, Long> {

    Optional<Peptido> findByNombreIgnoreCase(String nombre);

    List<Peptido> findByCategoriaIgnoreCase(String categoria);

    @Query("SELECT p FROM Peptido p WHERE " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.subtitulo) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.categoria) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.queEs) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.queHaceOEstudia) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.clave) LIKE LOWER(CONCAT('%', :buscar, '%')) " +
           "ORDER BY p.nombre ASC")
    List<Peptido> buscarTexto(@Param("buscar") String buscar);

    @Query("SELECT p FROM Peptido p WHERE " +
           "LOWER(p.categoria) = LOWER(:categoria) AND (" +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.subtitulo) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.queEs) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.queHaceOEstudia) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(p.clave) LIKE LOWER(CONCAT('%', :buscar, '%'))" +
           ") ORDER BY p.nombre ASC")
    List<Peptido> buscarPorCategoriaYTexto(@Param("categoria") String categoria, @Param("buscar") String buscar);

    @Query("SELECT DISTINCT p.categoria FROM Peptido p ORDER BY p.categoria ASC")
    List<String> findDistinctCategorias();

    @Query("SELECT MAX(p.fechaActualizacion) FROM Peptido p")
    Optional<java.time.LocalDateTime> findMaxFechaActualizacion();
}
