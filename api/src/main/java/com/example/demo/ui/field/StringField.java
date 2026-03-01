package com.example.demo.ui.field;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StringField extends UiField {
    private String regex;
    private String validationMessage;

    public StringField() {
        setType(FieldType.STRING);
    }
}