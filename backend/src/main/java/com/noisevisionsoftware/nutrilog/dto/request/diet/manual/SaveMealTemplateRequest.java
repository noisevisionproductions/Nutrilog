package com.noisevisionsoftware.nutrilog.dto.request.diet.manual;

import com.noisevisionsoftware.nutrilog.dto.request.recipe.NutritionalValuesRequest;
import com.noisevisionsoftware.nutrilog.dto.response.recipe.NutritionalValuesResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Valid
public class SaveMealTemplateRequest {

    @NotBlank(message = "Nazwa posiłku jest wymagana")
    private String name;

    private String instructions;
    private NutritionalValuesRequest nutritionalValues;
    private List<String> photos;
    private List<MealIngredientRequest> ingredients;
    private String mealType;
    private String category;
    private boolean shouldSave;
}
