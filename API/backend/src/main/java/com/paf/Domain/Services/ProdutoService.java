package com.paf.Domain.Services;

import com.paf.Domain.Mappers.ProductMapper;
import com.paf.Domain.Models.ProdutoModel;
import com.paf.Infrastructure.Entities.ProductEntity;
import com.paf.Infrastructure.Repository.ProdutoRepository;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@NoArgsConstructor
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public String CreateProduto(ProdutoModel produtoModel) {
    if (produtoModel == null) {
        return "Invalid product";
    }
    ProductEntity prod = ProductMapper.toEntity(produtoModel);

    ProductEntity saved = produtoRepository.save(prod);

    ProdutoModel savedModel = ProductMapper.toModel(saved);

    return "Product created with id: " + savedModel.getId();
    }


    public ProdutoModel GetByName(String nome) {
        Optional<ProductEntity> pbn = produtoRepository.findByNome(nome);
        if (pbn.isEmpty()) return null;
        // usa o mapper para converter entity -> model
        return ProductMapper.toModel(pbn.get());
    }

    public boolean deleteProduto(Long id) {
        if (!produtoRepository.existsById(id)) return false;
        produtoRepository.deleteById(id);
        return true;
    }

    public ProdutoModel UpdateProduto(ProdutoModel produtoModel) {
        if (produtoModel == null || produtoModel.getId() == null) return null;
        Optional<ProductEntity> opt = produtoRepository.findById(produtoModel.getId());
        if (opt.isEmpty()) return null;
        ProductEntity entity = opt.get();

        // usa o mapper para aplicar as alterações no entity sem perder o id
        ProductMapper.updateEntityFromModel(entity, produtoModel);

        ProductEntity saved = produtoRepository.save(entity);
        return ProductMapper.toModel(saved);
    }
}

