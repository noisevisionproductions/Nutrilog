package com.noisevisionsoftware.nutrilog.dto.request;

import com.noisevisionsoftware.nutrilog.model.changelog.ChangelogEntryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangelogEntryRequest {
    @NotBlank
    private String description;

    @NotNull
    private ChangelogEntryType type;
}