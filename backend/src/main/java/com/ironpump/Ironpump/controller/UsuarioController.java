package com.ironpump.Ironpump.controller;

import com.ironpump.Ironpump.model.Usuario;
import com.ironpump.Ironpump.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
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

    @PostMapping("/login")
    public Usuario login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");

        return repository.findByEmail(email)
                .filter(u -> u.getSenha().equals(senha)) // Validação simples de senha
                .orElseThrow(() -> new RuntimeException("Email ou senha inválidos"));
    }


    @GetMapping
    public List<Usuario> listar(){

        return repository.findAll();
    }
}
