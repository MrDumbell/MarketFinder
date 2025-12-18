package com.paf.Api.Controller;

import com.paf.Api.Dto.CorredorRequest;
import com.paf.Api.Dto.CorredorResponde; // Nota: Mantive o teu nome "Responde"
import com.paf.Domain.Mappers.CorredorMapper;
import com.paf.Domain.Models.CorredorModel;
import com.paf.Infrastructure.Entities.CorredorEntity;
import com.paf.Infrastructure.Entities.PrateleiraEntity;
import com.paf.Infrastructure.Repository.CorredorRepository;
import com.paf.Infrastructure.Repository.PrateleiraRepository;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/Corredor")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true") // 1. FIX CORS
public class CorredorController {

    @Autowired
    private CorredorRepository corredorRepository;

    @Autowired
    private PrateleiraRepository prateleiraRepository;

    @Setter
    private Long currentUserId;

    // --- LISTAR (GET) ---
    @GetMapping("/CGet")
    public ResponseEntity<List<CorredorResponde>> GetbyName(@RequestParam(required = false) String nome) {

        List<CorredorEntity> entidades;

        // 1. Se não vier nome, busca TODOS
        if (nome == null || nome.isEmpty()) {
            entidades = corredorRepository.findAll();
        }
        // 2. Se vier nome, busca ESPECÍFICO
        else {
            Optional<CorredorEntity> opt = corredorRepository.findByNome(nome);
            // FIX: Se não encontrar, retorna lista vazia em vez de 404 (para o React não falhar)
            if (opt.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            entidades = List.of(opt.get());
        }

        List<CorredorResponde> resposta = entidades.stream()
                .map(CorredorMapper::toModel)
                .map(CorredorResponde::fromModel)
                .collect(Collectors.toList());

        // FIX: Retorna sempre 200 OK
        return ResponseEntity.ok(resposta);
    }

    // --- CRIAR (POST) ---
    @PostMapping("/CPost")
    public ResponseEntity<CorredorResponde> CreateCorredor (@RequestBody CorredorRequest request){
        // Validação básica
        if (request == null || request.getNome() == null) {
            return ResponseEntity.badRequest().build();
        }

        CorredorModel model = new CorredorModel();
        model.setName(request.getNome());

        // Lógica do StoreId
        if (this.currentUserId != null) {
            model.setStoreId(this.currentUserId);
        } else if (request.getStoreId() != null) {
            model.setStoreId(request.getStoreId());
        } else {
            model.setStoreId(1L); // Default
        }

        CorredorEntity entity = CorredorMapper.toEntity(model);
        CorredorEntity saved = corredorRepository.save(entity);
        CorredorModel savedModel = CorredorMapper.toModel(saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(CorredorResponde.fromModel(savedModel));
    }

    // --- ATUALIZAR (PUT) ---
    @PutMapping("/CUpdt")
    public ResponseEntity<CorredorResponde> UpdateCorredor (@RequestBody CorredorRequest request){
        if (request == null || request.getId() == null) return ResponseEntity.badRequest().build();

        Optional<CorredorEntity> opt = corredorRepository.findById(request.getId());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CorredorModel model = CorredorMapper.toModel(opt.get());


        if (request.getNome() != null)
            model.setName(request.getNome());
        if (this.currentUserId != null) {
            model.setStoreId(this.currentUserId);
        }

        CorredorEntity entity = opt.get();
        CorredorMapper.updateEntityFromModel(entity, model);
        CorredorEntity saved = corredorRepository.save(entity);
        CorredorModel savedModel = CorredorMapper.toModel(saved);

        return ResponseEntity.ok(CorredorResponde.fromModel(savedModel));
    }

    // --- APAGAR (DELETE) ---
    // 2. FIX: Mudei para /CDelete e @RequestParam para bater certo com o api.js
    @DeleteMapping("/CDelete")
    public ResponseEntity<Void> DeleteCorredor (@RequestParam Long id){
        if (!corredorRepository.existsById(id)) return ResponseEntity.notFound().build();

        // Apagar prateleiras órfãs primeiro
        List<PrateleiraEntity> shelves = prateleiraRepository.findByIdCorredor(id);
        if (shelves != null && !shelves.isEmpty()) {
            prateleiraRepository.deleteAll(shelves);
        }

        corredorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // --- GET POR LOJA (Extra) ---
    @GetMapping("/CGetByStore/{storeId}")
    public ResponseEntity<List<CorredorResponde>> GetByStore(@PathVariable Long storeId) {
        List<CorredorEntity> list = corredorRepository.findByIdLoja(storeId);

        // FIX: Retorna lista vazia se não encontrar
        if (list == null || list.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<CorredorResponde> resp = list.stream()
                .map(c -> CorredorResponde.fromModel(CorredorMapper.toModel(c)))
                .collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }
}