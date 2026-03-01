package com.example.demo.ui;

import com.example.demo.ui.field.UiField;

import java.util.List;

public record UiSchema(
        List<UiField> fields
) {}