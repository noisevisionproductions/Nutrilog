package com.noisevisionsoftware.nutrilog.utils.excelParser.model.validation;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ValidationSeverity {
    ERROR,
    WARNING,
    SUCCESS;

    @JsonValue
    public String toLowerCase() {
        return this.name().toLowerCase();
    }
}
