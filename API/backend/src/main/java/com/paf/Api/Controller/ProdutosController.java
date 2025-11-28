package com.paf.Api.Controller;

import com.paf.Api.Dto.ProdutosRequest;
import com.paf.Api.Dto.ProdutosResponse;
import com.paf.Api.Dto.UserRequest;
import com.paf.Api.Dto.UserResponse;
import com.paf.Domain.Models.ProdutoModel;
import com.paf.Domain.Models.UserModel;
import com.paf.Domain.Services.ProdutoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/Prod")
public class ProdutosController {

    private final ProdutoService produtoService;

    public ProdutosController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping("/ProdGet")
    public ResponseEntity<ProdutosResponse> GetbyName(@RequestParam String nome){
        ProdutoModel pm = produtoService.GetByName(nome);
        if (pm == null) return ResponseEntity.notFound().build();
        ProdutosResponse pr = new ProdutosResponse();
        pr.setNome(pm.getNome());
        pr.setPreco(pm.getPreco());
        pr.setDescricao(pm.getDescricao());
        return ResponseEntity.ok(pr);
    }

    @PostMapping("/ProdCreate")
    public ResponseEntity<String> CreateProd(@RequestBody ProdutoModel produtoModel) {
        String createdProduto = produtoService.CreateProduto(produtoModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduto);
    }

    @DeleteMapping("/ProdDel/{id}")
    public ResponseEntity<Void> DeleteProd (@PathVariable Long id){
        boolean ok = produtoService.deleteProduto(id);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/AlterProd/{id}")
    public ResponseEntity<ProdutosResponse> UpdateUser(@PathVariable Long id, @RequestBody ProdutosRequest produtosRequest) {
        ProdutoModel model = new ProdutoModel();
        model.setId(id);
        model.setNome(produtosRequest.getNome());
        model.setDescricao(produtosRequest.getDescricao());
        model.setPreco(produtosRequest.getPreco());

        ProdutoModel updated = produtoService.UpdateProduto(model);
        if (updated == null) return ResponseEntity.notFound().build();
        ProdutosResponse r = new ProdutosResponse();
        r.setNome(updated.getNome());
        r.setDescricao(updated.getDescricao());
        r.setPreco(updated.getPreco());
        return ResponseEntity.ok(r);
    }



}
