package com.sep.core_service.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.info.Info;     // <-- Kiểm tra dòng này
import io.swagger.v3.oas.models.servers.Server; // <-- Và dòng này

import io.swagger.v3.oas.models.OpenAPI;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                // Thiết lập thông tin chung cho trang tài liệu
                .info(new Info()
                        .title("SEP API Documentation - Vũ Trí Dũng")
                        .version("1.0")
                        .description("Tài liệu API cho dự án Smart Education Platform (SEP). " +
                                "Bao gồm các module: Core, Grades, Attendance, Thesis, Survey."))
                // Thiết lập Server (Mặc định là localhost)
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Server Local (Development)")
                ));
    }
}