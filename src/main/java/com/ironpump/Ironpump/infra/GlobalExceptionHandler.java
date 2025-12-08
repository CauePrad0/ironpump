package com.ironpump.Ironpump.infra;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity tratarErro404(){
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity tratarErro400(MethodArgumentNotValidException ex) {
        var erros = ex.getFieldErrors();
        List<DadosErroValidacao> listaDeErros = erros.stream()
                .map(DadosErroValidacao::new)
                .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(listaDeErros);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity tratarErroRegraDeNegocio(RuntimeException ex){
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
    public record DadosErroValidacao(String campo, String Mensagem){
        public DadosErroValidacao(FieldError erro){
            this(erro.getField(), erro.getDefaultMessage());
        }
    }

}
