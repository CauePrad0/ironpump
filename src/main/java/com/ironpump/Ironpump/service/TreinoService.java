package com.ironpump.Ironpump.service;

import com.ironpump.Ironpump.dto.ProgressoDTO;
import com.ironpump.Ironpump.dto.TreinoLogDTO;
import com.ironpump.Ironpump.model.Exercicio;
import com.ironpump.Ironpump.model.TreinoLog;
import com.ironpump.Ironpump.model.Usuario;
import com.ironpump.Ironpump.repository.ExercicioRepository;
import com.ironpump.Ironpump.repository.TreinoLogRepository;
import com.ironpump.Ironpump.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class TreinoService {
    @Autowired
    private TreinoLogRepository treinoLogRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ExercicioRepository exercicioRepository;


    @Transactional
    public ProgressoDTO registrarTreino(TreinoLogDTO dto){
        TreinoLog treinoLog = converterParaEntity(dto);

        var treinoAnteriorOpt = treinoLogRepository
                .findFirstByUsuarioIdAndExercicioIdAndDataBeforeOrderByDataDesc(
                        dto.getUsuarioId(),
                        dto.getExercicioId(),
                        dto.getData()
                );
        TreinoLog treinoSalvo = treinoLogRepository.save(treinoLog);

        TreinoLog treinoAnterior = treinoAnteriorOpt.orElse(null);

        return converterParaProgressoDTO(treinoSalvo, treinoAnterior);
    }

    private TreinoLog converterParaEntity(TreinoLogDTO dto){
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));
        Exercicio exercicio = exercicioRepository.findById(dto.getExercicioId())
                .orElseThrow(() -> new RuntimeException("Exercicio não encontrado"));
        TreinoLog treinoLog = new TreinoLog();


        treinoLog.setUsuario(usuario);
        treinoLog.setExercicio(exercicio);
        treinoLog.setData(dto.getData());
        treinoLog.setSeries(dto.getSeries());
        treinoLog.setRepeticoes(dto.getRepeticoes());
        treinoLog.setCargaKg(dto.getCargaKg());
        treinoLog.setObservacoes(dto.getObservacoes());

        return treinoLog;


        //
    }
    private ProgressoDTO converterParaProgressoDTO(TreinoLog treinoAtual, TreinoLog treinoAnterior){

        Double cargaAnterior = (treinoAnterior != null)
                ? treinoAnterior.getCargaKg()
                :null;

        java.time.LocalDate dataAnterior = (treinoAnterior != null)
                ? treinoAnterior.getData()
                :null;

        Double diferenca = calcularDiferencaCarga(treinoAtual.getCargaKg(),cargaAnterior);

        Boolean evoluiu = null;
        Boolean regrediu = null;
        Boolean manteve = null;

        if (diferenca != null){
            if(diferenca> 0){
                evoluiu = true;
                regrediu = false;
                manteve = false;
            } else if (diferenca < 0) {
                evoluiu = false;
                regrediu = true;
                manteve = false;
            }
            else {
                evoluiu = false;
                regrediu = false;
                manteve = true;
            }
        }
        Integer diasDesdeUltimo = calcularDiasDesdeUltimo(
                treinoAtual.getData(), dataAnterior
        );

        return ProgressoDTO.builder()
                .id(treinoAtual.getId())
                .exercicioNome(treinoAtual.getExercicio().getNome())
                .grupoMuscular(treinoAtual.getExercicio().getGrupoMuscular())
                .data(treinoAtual.getData())
                .series(treinoAtual.getSeries())
                .repeticoes(treinoAtual.getRepeticoes())
                .cargaKg(treinoAtual.getCargaKg())
                .observacoes(treinoAtual.getObservacoes())
                .cargaAnterior(cargaAnterior)
                .dataAnterior(dataAnterior)
                .diasDesdeUltimo(diasDesdeUltimo)
                .diferencaCarga(diferenca)
                .evoluiu(evoluiu)
                .regrediu(regrediu)
                .manteve(manteve)
                .build();
        }
    private Double calcularDiferencaCarga(Double cargaAtual, Double cargaAnterior){
        if (cargaAnterior == null){
            return null;
        }
        return cargaAtual - cargaAnterior;
    }

    private Integer calcularDiasDesdeUltimo(java.time.LocalDate dataAtual, java.time.LocalDate dataAnterior){
        if (dataAnterior == null){
            return null;
        }
        long dias = ChronoUnit.DAYS.between(dataAnterior, dataAtual);

        return (int) dias;
    }
}
