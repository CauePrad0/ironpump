package com.ironpump.Ironpump.controller;

import com.ironpump.Ironpump.dto.ExercicioDTO;
import com.ironpump.Ironpump.model.Exercicio;
import com.ironpump.Ironpump.model.Usuario;
import com.ironpump.Ironpump.repository.ExercicioRepository;
import com.ironpump.Ironpump.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercicios")
public class ExercicioController {
    @Autowired
    private ExercicioRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Exercicio> listarPorUsuario(@RequestParam Long usuarioId){

        return repository.findByUsuarioId(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Exercicio criar(@RequestBody ExercicioDTO dto){

        boolean existe = repository.existsByNomeIgnoreCaseAndUsuarioId(dto.getNome(), dto.getUsuarioId());
        if (existe){
            throw new RuntimeException("Exercício já cadastrado para este usuário");
        }

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Exercicio exercicio = new Exercicio();
        exercicio.setNome(dto.getNome());
        exercicio.setGrupoMuscular(dto.getGrupoMuscular());
        exercicio.setObservacoes(dto.getObservacoes());
        exercicio.setUsuario(usuario);

        return repository.save(exercicio);
    }
}