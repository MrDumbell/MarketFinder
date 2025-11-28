package com.paf.Domain.Mappers;

import com.paf.Domain.Models.PrateleirasModel;
import com.paf.Infrastructure.Entities.PrateleiraEntity;

public interface PrateleiraMapper {

    static PrateleiraEntity toEntity(PrateleirasModel model) {
        if (model == null) return null;
        PrateleiraEntity e = new PrateleiraEntity();
        if (model.getId() != null) {
            e.setId(model.getId());
        }
        e.setNome(model.getName());
        e.setIdCorredor(model.getCorredorId());
        return e;
    }

    static PrateleirasModel toModel(PrateleiraEntity entity) {
        if (entity == null) return null;
        PrateleirasModel m = new PrateleirasModel();
        m.setId(entity.getId());
        m.setName(entity.getNome());
        m.setCorredorId(entity.getIdCorredor());
        return m;
    }

    static void updateEntityFromModel(PrateleiraEntity entity, PrateleirasModel model) {
        if (entity == null || model == null) return;
        if (model.getId() != null) {
            entity.setId(model.getId());
        }
        entity.setNome(model.getName());
        entity.setIdCorredor(model.getCorredorId());
    }
}
