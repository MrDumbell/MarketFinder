package com.paf.Domain.Models;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor

public class PrateleirasModel {
    private Long id;
    private String name;
    private Long corredorId;
}
