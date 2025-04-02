package com.noisevisionsoftware.nutrilog.dto.request.newsletter.sendgrid;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {

    private String subject;

    private String content;

    private List<String> recipients;

    /**
     * Kategorie wiadomości dla celów analitycznych i śledzenia
     */
    private List<String> categories;

    private boolean useTemplate = false;

    /**
     * Typ szablonu do użycia
     * Możliwe wartości: basic, promotional, survey, announcement
     */
    private String templateType = "basic";
}