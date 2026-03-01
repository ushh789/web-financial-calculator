package com.example.demo.ui.field;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateField extends UiField {
    public DateField() {
        setType(FieldType.DATE);
    }
}