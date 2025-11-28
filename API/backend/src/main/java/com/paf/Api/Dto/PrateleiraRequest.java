package com.paf.Api.Dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

@Getter
@Setter
@NoArgsConstructor
public class PrateleiraRequest {
    // opcional para updates
    private Long id;

    @SuppressWarnings("deprecation")
    @NotNull
    private String name;

    // id do corredor associado (pode vir no body ou ser definido pelo controller)
    private Long corredorId;
}

