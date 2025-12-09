package com.ironpump.Ironpump.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreinoLogDTO {
    @NotNull(message = "Usuario é obrigatorio")
    private Long usuarioId;

    @NotNull(message = "Exercício é obrigatorio")
    private Long exercicioId;

    @NotNull(message = "Data é obrigatoria")
    @PastOrPresent(message = "Data não pode ser futura")
    private LocalDate data;

    @NotNull(message = "Series são obrigatorias")
    @Min(value = 1, message = "Deve ter pelo menos 1 série")
    private Integer series;

    @NotNull(message = "Repetições são obrigatorias")
    @Min(value = 1, message = "Deve ter pelo menos 1 repetição")
    private Integer repeticoes;

    @NotNull(message = "Carga é obrigatoria")
    @DecimalMin(value = "0.0", message = "Carga não pode ser negativa")
    private Double cargaKg;

    @Size(max = 500, message = "Observações não podem ter mais de 500 caracteres")
    private String observacoes;



}
