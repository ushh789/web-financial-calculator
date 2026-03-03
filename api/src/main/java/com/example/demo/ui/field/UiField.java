package com.example.demo.ui.field;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;
import lombok.Setter;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = NumberField.class, name = "NUMBER"),
        @JsonSubTypes.Type(value = SelectField.class, name = "SELECT"),
        @JsonSubTypes.Type(value = StringField.class, name = "STRING"),
        @JsonSubTypes.Type(value = BooleanField.class, name = "BOOLEAN"),
        @JsonSubTypes.Type(value = DateField.class, name = "DATE")
})
@Getter
@Setter
public abstract class UiField {
    private String name;
    private String label;
    private FieldType type;
    private boolean required;
    private Object defaultValue;
    private int order;
}