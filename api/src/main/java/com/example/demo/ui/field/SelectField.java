package com.example.demo.ui.field;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SelectField extends UiField {
    private List<String> options;

    public SelectField() {
        setType(FieldType.SELECT);
    }
}