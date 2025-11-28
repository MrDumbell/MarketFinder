package com.paf.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")                     // permite todos os endpoints
                        .allowedOrigins("http://127.0.0.1:5500") // origem do teu Live Server
                        .allowedMethods("GET","POST","PUT","DELETE","OPTIONS") // métodos permitidos
                        .allowedHeaders("*")                     // headers permitidos
                        .allowCredentials(true);
            }
        };
    }
}
