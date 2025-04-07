package com.noisevisionsoftware.nutrilog.exception;

public class MeasurementNotFoundException extends RuntimeException {
    public MeasurementNotFoundException(String id) {
        super("Nie znaleziono pomiaru o ID: " + id);
    }

    public MeasurementNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}