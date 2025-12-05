package com.ironpump.Ironpump.repository;

import com.ironpump.Ironpump.model.TreinoLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreinoLogRepository extends JpaRepository<TreinoLog, Long> {
    List<TreinoLog>findByUsuarioIdOrderByDataTreinoDesc(Long id);
    List<TreinoLog>findByUsuarioIdAndExercicioIdOrderByDataTreinoDesc(Long usuario, Long exercicioId);
}
