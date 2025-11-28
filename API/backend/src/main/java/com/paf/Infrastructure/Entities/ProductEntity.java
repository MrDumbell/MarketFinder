package com.paf.Infrastructure.Entities;

import jakarta.persistence.*; // Certifique-se de que está a usar jakarta.persistence
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "produtos") // O nome da tabela deve ser o mesmo da base de dados
@Getter
@Setter
public class ProductEntity {

    @Id // Marca como chave primária
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Estratégia para ID autoincrementável
    @JoinColumn(name = "id_prod") // O nome da coluna na base de dados
    private Long id;
    @JoinColumn(name = "nome")// Nome do produto, não pode ser nulo
    private String nome;
    @JoinColumn(name = "descricao") // Descrição do produto
    private String descricao;
    @JoinColumn(name = "preco") // Preço do produto, não pode ser nulo
    private double preco;

}