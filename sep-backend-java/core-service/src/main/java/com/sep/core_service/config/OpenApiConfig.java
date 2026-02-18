package com.sep.core_service.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // 1. Thiết lập thông tin chung
                .info(new Info()
                        .title("SEP API Documentation - Vũ Trí Dũng")
                        .version("1.0")
                        .description("Tài liệu API dự án SEP. Đã tích hợp bảo mật JWT."))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Server Local")
                ))
                // 2. Cấu hình nút "Authorize" (Ổ khóa)
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}