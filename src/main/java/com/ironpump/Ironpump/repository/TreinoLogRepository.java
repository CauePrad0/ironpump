package com.ironpump.Ironpump.repository;

import com.ironpump.Ironpump.model.TreinoLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreinoLogRepository extends JpaRepository<TreinoLog, Long> {

    List<TreinoLog> findByUsuarioIdOrderByDataDesc(Long usuarioId);

    List<TreinoLog> findByUsuarioIdAndExercicioIdOrderByDataDesc(Long usuarioId, Long exercicioId);

    Optional<TreinoLog> findFirstByUsuarioIdAndExercicioIdAndDataBeforeOrderByDataDesc(
            Long usuarioId,
            Long exercicioId,
            LocalDate data
    );
}