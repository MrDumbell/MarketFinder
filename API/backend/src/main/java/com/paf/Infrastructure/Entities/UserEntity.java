package com.paf.Infrastructure.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table (name = "users")
@Getter
@Setter
public class UserEntity {

    @Id
    @Column (name = "id_user")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JoinColumn (name = "Nome_user")
    private String nome;
    @JoinColumn (name = "email_user")
    private String email;
    @JoinColumn (name = "senha_user")
    private String senha;

}
