package com.ironpump.Ironpump.repository;

import com.ironpump.Ironpump.model.Exercicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {
    List<Exercicio> findByGrupoMuscularIgnoreCase(String grupoMuscular);
    List<Exercicio> findByUsuarioId(Long usuarioId);
    Optional<Exercicio> findByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCaseAndUsuarioId(String nome, Long usuarioId);
}
