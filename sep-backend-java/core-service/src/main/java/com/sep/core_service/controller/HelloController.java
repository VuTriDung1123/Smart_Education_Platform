package com.sep.core_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/")
    public String sayHello() {
        return "Chào Vũ Trí Dũng! Dự án SEP đã sẵn sàng thực chiến.";
    }
}