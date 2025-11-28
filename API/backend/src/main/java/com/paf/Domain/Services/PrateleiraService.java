// API/backend/src/main/java/com/paf/Domain/Services/PrateleiraService.java
package com.paf.Domain.Services;

import com.paf.Domain.Mappers.PrateleiraMapper;
import com.paf.Domain.Models.PrateleirasModel;
import com.paf.Infrastructure.Entities.PrateleiraEntity;
import com.paf.Infrastructure.Repository.PrateleiraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PrateleiraService {
    private final PrateleiraRepository repository;

    @Autowired
    public PrateleiraService(PrateleiraRepository repository) {
        this.repository = repository;
    }

    /**
     * Garante que a prateleira tenha o id do corredor associado.
     * Use no Controller: service.ensureCorredorId(prateleiraModel, corredorId);
     */
    public PrateleirasModel ensureCorredorId(PrateleirasModel prateleira, Long corredorId) {
        if (prateleira == null) {
            return null;
        }
        prateleira.setCorredorId(corredorId);
        return prateleira;
    }

    // Cria prateleira simples (assume corredorId já setado no model via ensureCorredorId se necessário)
    public String createPrateleira(PrateleirasModel model) {
        if (model == null) return "Invalid prateleira";

        PrateleiraEntity entity = PrateleiraMapper.toEntity(model);

        PrateleiraEntity saved = repository.save(entity);
        model.setId(saved.getId());
        return "Shelf created with id: " + saved.getId();
    }

    public PrateleirasModel getById(Long id) {
        Optional<PrateleiraEntity> opt = repository.findById(id);
        if (opt.isEmpty()) return null;
        return PrateleiraMapper.toModel(opt.get());
    }

    public boolean deletePrateleira(Long id) {
        if (!repository.existsById(id)) return false;
        repository.deleteById(id);
        return true;
    }

    public PrateleirasModel updatePrateleira(PrateleirasModel model) {
        if (model == null || model.getId() == null) return null;
        Optional<PrateleiraEntity> opt = repository.findById(model.getId());
        if (opt.isEmpty()) return null;
        PrateleiraEntity entity = opt.get();

        // atualiza campos via mapper
        PrateleiraMapper.updateEntityFromModel(entity, model);

        PrateleiraEntity saved = repository.save(entity);

        return PrateleiraMapper.toModel(saved);
    }

    public List<PrateleirasModel> getByCorredor(Long corredorId) {
        if (corredorId == null) return java.util.Collections.emptyList();
        List<PrateleiraEntity> entities = repository.findAll();
        return entities.stream()
                .filter(e -> corredorId.equals(e.getIdCorredor()))
                .map(PrateleiraMapper::toModel)
                .collect(Collectors.toList());
    }
}
