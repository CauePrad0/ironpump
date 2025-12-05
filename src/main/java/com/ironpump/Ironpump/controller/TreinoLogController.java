package com.ironpump.Ironpump.controller;

import com.ironpump.Ironpump.model.TreinoLog;
import com.ironpump.Ironpump.repository.TreinoLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/treinos")
public class TreinoLogController {
    @Autowired
    private TreinoLogRepository repository;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TreinoLog registrarTreino(@RequestBody TreinoLog treinoLog){
        return repository.save(treinoLog);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<TreinoLog> listarPorUsuario(@PathVariable Long usuarioId){
        return repository.findByUsuarioIdOrderByDataTreinoDesc(usuarioId);
    }
}
