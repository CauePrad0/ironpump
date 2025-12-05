package com.ironpump.Ironpump.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "exercicios")
public class Exercicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String grupoMuscular;

    @Column(length = 500)
    private String observacoes;

    @OneToMany(mappedBy = "exercicio", cascade = CascadeType.ALL)
    private List<TreinoLog> treinos = new ArrayList<>();
}
