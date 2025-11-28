// java
package com.paf.Api.Controller;

import com.paf.Api.Dto.PrateleiraRequest;
import com.paf.Api.Dto.PrateleiraResponse;
import com.paf.Domain.Mappers.PrateleiraMapper;
import com.paf.Domain.Models.PrateleirasModel;
import com.paf.Domain.Services.PrateleiraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/prateleiras")
public class PrateleiraController {

    private final PrateleiraService prateleiraService;

    @Autowired
    public PrateleiraController(PrateleiraService prateleiraService) {
        this.prateleiraService = prateleiraService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrateleiraResponse> getById(@PathVariable Long id) {
        PrateleirasModel m = prateleiraService.getById(id);
        if (m == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(PrateleiraResponse.fromModel(m));
    }

    // GET /prateleiras?corredorId=123
    @GetMapping(params = "corredorId")
    public ResponseEntity<List<PrateleiraResponse>> getByCorredor(@RequestParam Long corredorId) {
        List<PrateleirasModel> models = prateleiraService.getByCorredor(corredorId);
        if (models == null || models.isEmpty()) return ResponseEntity.noContent().build();
        List<PrateleiraResponse> resp = models.stream()
                .map(PrateleiraResponse::fromModel)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<PrateleiraResponse> create(@RequestBody PrateleiraRequest req) {
        if (req == null || req.getName() == null) return ResponseEntity.badRequest().build();
        PrateleirasModel model = new PrateleirasModel();
        model.setName(req.getName());
        model.setCorredorId(req.getCorredorId());
        prateleiraService.createPrateleira(model);
        PrateleirasModel created = prateleiraService.getById(model.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(PrateleiraResponse.fromModel(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrateleiraResponse> update(@PathVariable Long id, @RequestBody PrateleiraRequest req) {
        if (req == null) return ResponseEntity.badRequest().build();
        PrateleirasModel model = new PrateleirasModel();
        model.setId(id);
        model.setName(req.getName());
        model.setCorredorId(req.getCorredorId());
        PrateleirasModel updated = prateleiraService.updatePrateleira(model);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(PrateleiraResponse.fromModel(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean ok = prateleiraService.deletePrateleira(id);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
