package com.paf.Api.Controller;

import com.paf.Api.Dto.CorredorRequest;
import com.paf.Api.Dto.CorredorResponde;
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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/corredores")
public class CorredorController {

    @Autowired
    private CorredorRepository corredorRepository;

    @Autowired
    private PrateleiraRepository prateleiraRepository;

    // Setter público para ser chamado pelo caller/teste para definir o usuário atual
    @Setter
    private Long currentUserId; // definido externamente via setter

    @GetMapping("/CGet")
    public ResponseEntity<CorredorResponde> GetbyName (@RequestParam String nome){
        Optional<CorredorEntity> opt = corredorRepository.findByNome(nome);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        CorredorModel m = CorredorMapper.toModel(opt.get());
        return ResponseEntity.ok(CorredorResponde.fromModel(m));
    }

    @PostMapping("/CPost")
    public ResponseEntity<CorredorResponde> CreateCorredor (@RequestBody CorredorRequest request){
        if (request == null || request.getName() == null) return ResponseEntity.badRequest().build();

        CorredorModel model = new CorredorModel();
        model.setName(request.getName());

        // garante que o storeId seja sempre o id do usuário configurado ou do request
        if (this.currentUserId != null) {
            model.setStoreId(this.currentUserId);
        } else if (request.getStoreId() != null) {
            model.setStoreId(request.getStoreId());
        } else {
            // fallback mínimo: setar loja 1 se não for fornecido (para dev).
            model.setStoreId(1L);
        }

        CorredorEntity entity = CorredorMapper.toEntity(model);
        CorredorEntity saved = corredorRepository.save(entity);
        CorredorModel savedModel = CorredorMapper.toModel(saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(CorredorResponde.fromModel(savedModel));
    }

    @PutMapping("/CUpdt")
    public ResponseEntity<CorredorResponde> UpdateCorredor (@RequestBody CorredorRequest request){
        if (request == null || request.getId() == null) return ResponseEntity.badRequest().build();

        Optional<CorredorEntity> opt = corredorRepository.findById(request.getId());
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CorredorModel model = CorredorMapper.toModel(opt.get());

        // aplicar alterações vindas do request
        if (request.getName() != null)
            model.setName(request.getName());

        // garante que o storeId seja sempre o id do usuário configurado
        if (this.currentUserId != null) {
            model.setStoreId(this.currentUserId);
        }

        CorredorEntity entity = opt.get();
        CorredorMapper.updateEntityFromModel(entity, model);
        CorredorEntity saved = corredorRepository.save(entity);
        CorredorModel savedModel = CorredorMapper.toModel(saved);

        return ResponseEntity.ok(CorredorResponde.fromModel(savedModel));
    }

    @DeleteMapping("/CDel/{id}")
    public ResponseEntity<Void> DeleteCorredor (@PathVariable Long id){
        if (!corredorRepository.existsById(id)) return ResponseEntity.notFound().build();

        // apagar prateleiras associadas primeiro para evitar constraint de FK
        List<PrateleiraEntity> shelves = prateleiraRepository.findByIdCorredor(id);
        if (shelves != null && !shelves.isEmpty()) {
            prateleiraRepository.deleteAll(shelves);
        }

        corredorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/CGetByStore/{storeId}")
    public ResponseEntity<List<CorredorResponde>> GetByStore(@PathVariable Long storeId) {
        List<CorredorEntity> list = corredorRepository.findByIdLoja(storeId);
        if (list == null || list.isEmpty()) return ResponseEntity.notFound().build();
        List<CorredorResponde> resp = list.stream().map(c -> {
            return CorredorResponde.fromModel(CorredorMapper.toModel(c));
        }).collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }
}
