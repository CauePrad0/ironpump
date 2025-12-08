package com.ironpump.Ironpump.controller;

import com.ironpump.Ironpump.model.Exercicio;
import com.ironpump.Ironpump.repository.ExercicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercicios")
public class ExercicioController {
    @Autowired
    private ExercicioRepository repository;

    @GetMapping
    public List<Exercicio> listarTodos(){
        return repository.findAll();
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Exercicio criar(@RequestBody Exercicio exercicio){
        boolean existe = repository.existsByNomeIgnoreCase(exercicio.getNome());
        if (existe){
            throw new RuntimeException("Exercicio já cadastrado");
        }
        return repository.save(exercicio);
    }
}
