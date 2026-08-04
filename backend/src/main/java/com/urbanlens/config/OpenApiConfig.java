package com.urbanlens.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI urbanLensOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("UrbanLens API")
                        .description("Backend API for the UrbanLens travel intelligence app")
                        .version("0.1.0-phase1"));
    }
}
