package com.noisevisionsoftware.nutrilog.dto.response;

import com.noisevisionsoftware.nutrilog.utils.excelParser.model.ParsedDay;
import com.noisevisionsoftware.nutrilog.utils.excelParser.model.ParsedProduct;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DietPreviewResponse {
    private List<ParsedDay> days;
    private List<Map.Entry<String, ParsedProduct>> shoppingList;

    @Builder.Default
    private boolean valid = true;

    private String validationMessage;

    @Builder.Default
    private Map<String, Object> additionalData = new HashMap<>();
}