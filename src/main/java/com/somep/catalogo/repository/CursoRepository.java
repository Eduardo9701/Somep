package com.somep.catalogo.repository;

import com.somep.catalogo.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {

    List<Curso> findByActivoTrueOrderByOrdenAscIdDesc();

    List<Curso> findAllByOrderByOrdenAscIdDesc();

    @Query("SELECT c FROM Curso c WHERE c.activo = true AND (" +
           "(:tipo IS NULL OR LOWER(c.tipo) = LOWER(:tipo) OR (:tipo = 'curso' AND LOWER(c.tipo) IN ('curso', 'diplomado'))) " +
           ") AND (" +
           "(:buscar IS NULL OR LOWER(c.titulo) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(c.meta1) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(c.meta2) LIKE LOWER(CONCAT('%', :buscar, '%')))" +
           ") ORDER BY c.orden ASC, c.id DESC")
    List<Curso> buscarPublicos(@Param("tipo") String tipo, @Param("buscar") String buscar);

    @Query("SELECT c FROM Curso c WHERE (" +
           "(:tipo IS NULL OR LOWER(c.tipo) = LOWER(:tipo)) " +
           ") AND (" +
           "(:buscar IS NULL OR LOWER(c.titulo) LIKE LOWER(CONCAT('%', :buscar, '%')) OR " +
           "LOWER(c.descripcion) LIKE LOWER(CONCAT('%', :buscar, '%')))" +
           ") ORDER BY c.orden ASC, c.id DESC")
    List<Curso> buscarAdmin(@Param("tipo") String tipo, @Param("buscar") String buscar);

    long countByActivoTrue();
}
