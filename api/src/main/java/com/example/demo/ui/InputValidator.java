package com.example.demo.ui;

import com.example.demo.ui.field.BooleanField;
import com.example.demo.ui.field.DateField;
import com.example.demo.ui.field.NumberField;
import com.example.demo.ui.field.SelectField;
import com.example.demo.ui.field.StringField;
import com.example.demo.ui.field.UiField;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class InputValidator {

    private final ObjectMapper objectMapper;

    public void validate(Map<String, Object> inputData, Map<String, Object> uiSchemaMap) {
        if (uiSchemaMap == null) {
            return;
        }

        UiSchema schema = objectMapper.convertValue(uiSchemaMap, UiSchema.class);

        if (schema.fields() == null) {
            return;
        }

        for (UiField field : schema.fields()) {
            String fieldName = field.getName();
            if (checkRequired(inputData, field, fieldName)) continue;
            validateFieldValue(inputData, field, fieldName);
        }
    }

    private void validateFieldValue(Map<String, Object> inputData, UiField field, String fieldName) {
        Object value = inputData.get(fieldName);

        switch (field) {
            case NumberField numberField -> validateNumber(numberField, value);
            case SelectField selectField -> validateSelect(selectField, value);
            case StringField stringField -> validateString(stringField, value);
            case BooleanField booleanField -> validateBoolean(booleanField, value);
            case DateField dateField -> validateDate(dateField, value);
            default -> throw new IllegalStateException("Unknown field type: " + field.getClass());
        }
    }

    private boolean checkRequired(Map<String, Object> inputData, UiField field, String fieldName) {
        if (!inputData.containsKey(fieldName)) {
            if (field.isRequired()) {
                throw new IllegalArgumentException("Missing required field: " + fieldName);
            }
            return true;
        }
        return false;
    }

    private void validateNumber(NumberField field, Object value) {
        if (!(value instanceof Number)) {
            throw new IllegalArgumentException("Field '" + field.getName() + "' must be a number");
        }
        double doubleValue = ((Number) value).doubleValue();

        if (field.getMin() != null && doubleValue < field.getMin()) {
            throw new IllegalArgumentException("Field '" + field.getName() + "' must be at least " + field.getMin());
        }
        if (field.getMax() != null && doubleValue > field.getMax()) {
            throw new IllegalArgumentException("Field '" + field.getName() + "' must be at most " + field.getMax());
        }
    }

    private void validateSelect(SelectField field, Object value) {
        String stringValue = String.valueOf(value);
        if (field.getOptions() != null && !field.getOptions().contains(stringValue)) {
            throw new IllegalArgumentException("Field '" + field.getName() + "' has invalid value. Allowed: " + field.getOptions());
        }
    }

    private void validateString(StringField field, Object value) {
        String stringValue = String.valueOf(value);
        if (field.getRegex() != null && !stringValue.matches(field.getRegex())) {
            String message = field.getValidationMessage() != null ? field.getValidationMessage() : "Field '" + field.getName() + "' has invalid format";
            throw new IllegalArgumentException(message);
        }
    }

    private void validateBoolean(BooleanField field, Object value) {
        if (!(value instanceof Boolean)) {
            throw new IllegalArgumentException("Field '" + field.getName() + "' must be a boolean");
        }
    }
    
    private void validateDate(DateField field, Object value) {
        // Basic check, could be improved with parsing
        if (!(value instanceof String)) {
             throw new IllegalArgumentException("Field '" + field.getName() + "' must be a date string");
        }
    }
}