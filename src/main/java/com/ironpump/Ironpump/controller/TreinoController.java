// Arquivo: TreinoController.java
package com.ironpump.Ironpump.controller;

import com.ironpump.Ironpump.dto.ProgressoDTO;
import com.ironpump.Ironpump.dto.TreinoLogDTO;
import com.ironpump.Ironpump.service.TreinoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/treinos")
public class TreinoController {

    @Autowired
    private TreinoService treinoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgressoDTO registrarTreino(@Valid @RequestBody TreinoLogDTO dto) {
        return treinoService.registrarTreino(dto);
    }
}