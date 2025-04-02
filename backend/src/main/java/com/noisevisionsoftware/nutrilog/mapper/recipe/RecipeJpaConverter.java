package com.noisevisionsoftware.nutrilog.mapper.recipe;

import com.google.cloud.Timestamp;
import com.noisevisionsoftware.nutrilog.model.recipe.NutritionalValues;
import com.noisevisionsoftware.nutrilog.model.recipe.Recipe;
import com.noisevisionsoftware.nutrilog.model.recipe.jpa.NutritionalValuesEntity;
import com.noisevisionsoftware.nutrilog.model.recipe.jpa.RecipeEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.UUID;

@Component
public class RecipeJpaConverter {

    public RecipeEntity toJpaEntity(Recipe recipe) {
        if (recipe == null) return null;

        NutritionalValuesEntity nutritionalValuesEntity = null;
        if (recipe.getNutritionalValues() != null) {
            nutritionalValuesEntity = NutritionalValuesEntity.builder()
                    .calories(recipe.getNutritionalValues().getCalories())
                    .protein(recipe.getNutritionalValues().getProtein())
                    .fat(recipe.getNutritionalValues().getFat())
                    .carbs(recipe.getNutritionalValues().getCarbs())
                    .build();
        }

        LocalDateTime createdAt;
        if (recipe.getCreatedAt() != null) {
            createdAt = LocalDateTime.ofEpochSecond(
                    recipe.getCreatedAt().getSeconds(),
                    recipe.getCreatedAt().getNanos(),
                    ZoneOffset.UTC);
        } else {
            createdAt = LocalDateTime.now();
        }

        String externalId = recipe.getId();
        if (externalId == null || externalId.isEmpty()) {
            // Jeśli brak ID, użyj UUID jako fallback
            externalId = UUID.randomUUID().toString();
        }

        return RecipeEntity.builder()
                .externalId(externalId) // Używamy oryginalnego ID
                .name(recipe.getName())
                .instructions(recipe.getInstructions())
                .createdAt(createdAt)
                .photos(recipe.getPhotos() != null ? new ArrayList<>(recipe.getPhotos()) : new ArrayList<>())
                .nutritionalValues(nutritionalValuesEntity)
                .parentRecipeId(recipe.getParentRecipeId())
                .build();
    }

    public Recipe toModel(RecipeEntity entity) {
        if (entity == null) return null;

        NutritionalValues nutritionalValues = null;
        if (entity.getNutritionalValues() != null) {
            nutritionalValues = NutritionalValues.builder()
                    .calories(entity.getNutritionalValues().getCalories())
                    .protein(entity.getNutritionalValues().getProtein())
                    .fat(entity.getNutritionalValues().getFat())
                    .carbs(entity.getNutritionalValues().getCarbs())
                    .build();
        }

        Timestamp createdAt = null;
        if (entity.getCreatedAt() != null) {
            createdAt = Timestamp.ofTimeSecondsAndNanos(
                    entity.getCreatedAt().toEpochSecond(ZoneOffset.UTC),
                    entity.getCreatedAt().getNano());
        }

        return Recipe.builder()
                .id(entity.getExternalId())
                .name(entity.getName())
                .instructions(entity.getInstructions())
                .createdAt(createdAt)
                .photos(entity.getPhotos())
                .nutritionalValues(nutritionalValues)
                .parentRecipeId(entity.getParentRecipeId())
                .build();
    }
}