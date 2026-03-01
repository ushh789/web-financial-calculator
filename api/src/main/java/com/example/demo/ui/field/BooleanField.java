package com.example.demo.ui.field;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BooleanField extends UiField {
    public BooleanField() {
        setType(FieldType.BOOLEAN);
    }
}