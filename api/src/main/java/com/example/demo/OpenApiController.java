package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OpenApiController {

    @Value("classpath:openapi/api.yaml")
    private Resource openApiResource;

    @GetMapping(value = "/api.yaml", produces = "application/yaml")
    public ResponseEntity<Resource> getOpenApiYaml() {
        return ResponseEntity.ok(openApiResource);
    }
}