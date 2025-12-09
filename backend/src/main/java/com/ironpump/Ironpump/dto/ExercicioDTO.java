package com.ironpump.Ironpump.dto;

import lombok.Data;

@Data
public class ExercicioDTO {
    private String nome;
    private String grupoMuscular;
    private String observacoes;
    private Long usuarioId;
}