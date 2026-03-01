package com.example.demo.ui.field;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NumberField extends UiField {
    private Double min;
    private Double max;
    
    public NumberField() {
        setType(FieldType.NUMBER);
    }
}