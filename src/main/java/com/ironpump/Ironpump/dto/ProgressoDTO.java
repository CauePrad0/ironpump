package com.ironpump.Ironpump.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.beans.XMLEncoder;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressoDTO {

    private Long id;

    private String exercicioNome;
    private String grupoMuscular;
    private LocalDate data;
    private Integer series;
    private Integer repeticoes;
    private Double cargaKg;
    private String observacoes;

    private Double cargaAnterior;
    private LocalDate dataAnterior;
    private Integer diasDesdeUltimo;

    private Double diferencaCarga;
    private Boolean evoluiu;
    private Boolean regrediu;
    private Boolean manteve;

}
