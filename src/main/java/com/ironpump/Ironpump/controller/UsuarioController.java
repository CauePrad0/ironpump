package com.ironpump.Ironpump.controller;

import com.ironpump.Ironpump.model.Usuario;
import com.ironpump.Ironpump.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Usuario criar(@RequestBody Usuario usuario){
        if(repository.existsByEmail(usuario.getEmail())){
            throw new RuntimeException("Email já cadastrado!");
        }
        return repository.save(usuario);
    }

    @GetMapping
    public List<Usuario> listar(){
        return repository.findAll();
    }
}
