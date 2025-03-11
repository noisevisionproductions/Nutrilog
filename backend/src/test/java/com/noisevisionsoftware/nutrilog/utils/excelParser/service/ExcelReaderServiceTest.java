package com.noisevisionsoftware.nutrilog.utils.excelParser.service;

import com.noisevisionsoftware.nutrilog.utils.excelParser.config.ExcelReadConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ExcelReaderServiceTest {

    @Test
    @DisplayName("Domyślna konfiguracja powinna mieć poprawne wartości")
    void defaultConfigShouldHaveCorrectValues() {
        ExcelReadConfig config = new ExcelReadConfig.Builder().build();

        assertEquals(0, config.getSheetNumber());
        assertEquals(0, config.getHeaderRowNumber());
        assertTrue(config.shouldSkipEmptyRows());
        assertTrue(config.shouldTrimCells());
    }

    @Test
    @DisplayName("Builder powinien prawidłowo ustawiać wartości")
    void builderShouldSetValuesCorrectly() {
        ExcelReadConfig config = new ExcelReadConfig.Builder()
                .sheetNumber(2)
                .headerRowNumber(3)
                .skipEmptyRows(false)
                .trimCells(false)
                .build();

        assertEquals(2, config.getSheetNumber());
        assertEquals(3, config.getHeaderRowNumber());
        assertFalse(config.shouldSkipEmptyRows());
        assertFalse(config.shouldTrimCells());
    }

    @Test
    @DisplayName("Builder powinien umożliwiać płynne konfigurowanie")
    void builderShouldAllowFluentConfiguration() {
        ExcelReadConfig config = new ExcelReadConfig.Builder()
                .sheetNumber(1)
                .headerRowNumber(2)
                .skipEmptyRows(true)
                .trimCells(false)
                .build();

        assertEquals(1, config.getSheetNumber());
        assertEquals(2, config.getHeaderRowNumber());
        assertTrue(config.shouldSkipEmptyRows());
        assertFalse(config.shouldTrimCells());
    }

    @Test
    @DisplayName("Częściowa konfiguracja powinna zachować pozostałe domyślne wartości")
    void partialConfigurationShouldPreserveDefaultValues() {
        ExcelReadConfig config = new ExcelReadConfig.Builder()
                .sheetNumber(1)
                .build();

        assertEquals(1, config.getSheetNumber());
        assertEquals(0, config.getHeaderRowNumber()); // domyślna wartość
        assertTrue(config.shouldSkipEmptyRows()); // domyślna wartość
        assertTrue(config.shouldTrimCells()); // domyślna wartość
    }
}