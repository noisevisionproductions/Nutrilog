package com.noisevisionsoftware.nutrilog.utils.excelParser.service;

import com.noisevisionsoftware.nutrilog.model.recipe.NutritionalValues;
import com.noisevisionsoftware.nutrilog.service.category.ProductCategorizationService;
import com.noisevisionsoftware.nutrilog.utils.excelParser.config.ExcelParserConfig;
import com.noisevisionsoftware.nutrilog.utils.excelParser.model.ParsedMeal;
import com.noisevisionsoftware.nutrilog.utils.excelParser.model.ParsedProduct;
import com.noisevisionsoftware.nutrilog.utils.excelParser.model.ParsingResult;
import com.noisevisionsoftware.nutrilog.utils.excelParser.service.helpers.UnitService;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExcelParserServiceTest {

    @Mock
    private ProductParsingService productParsingService;

    @Mock
    private ProductCategorizationService categorizationService;

    @Mock
    private UnitService unitService;

    @Mock
    private ExcelParserConfig excelParserConfig;

    @InjectMocks
    private ExcelParserService excelParserService;

    private MultipartFile createMockExcelFile() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("DietTemplate");

        // Wiersz nagłówkowy
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Lp.");
        headerRow.createCell(1).setCellValue("Nazwa posiłku");
        headerRow.createCell(2).setCellValue("Przygotowanie");
        headerRow.createCell(3).setCellValue("Składniki");
        headerRow.createCell(4).setCellValue("Wartości odżywcze (kcal,białko,tłuszcz,węglowodany)");

        // Dane posiłków
        // Posiłek 1
        Row mealRow1 = sheet.createRow(1);
        mealRow1.createCell(0).setCellValue(1);
        mealRow1.createCell(1).setCellValue("Owsianka z owocami");
        mealRow1.createCell(2).setCellValue("Ugotować płatki na mleku, dodać owoce");
        mealRow1.createCell(3).setCellValue("50g płatki owsiane, 200ml mleko 2%, 1 banan");
        mealRow1.createCell(4).setCellValue("350,15,7,60");

        // Posiłek 2
        Row mealRow2 = sheet.createRow(2);
        mealRow2.createCell(0).setCellValue(2);
        mealRow2.createCell(1).setCellValue("Sałatka z kurczakiem");
        mealRow2.createCell(2).setCellValue("Wymieszać składniki");
        mealRow2.createCell(3).setCellValue("100g pierś z kurczaka, 50g sałata, 20g pomidor");
        mealRow2.createCell(4).setCellValue("250,30,10,5");

        // Pusty wiersz
        sheet.createRow(3);

        // Posiłek 3 (niepełny)
        Row mealRow3 = sheet.createRow(4);
        mealRow3.createCell(0).setCellValue(3);
        mealRow3.createCell(1).setCellValue("Koktajl proteinowy");

        // Zapisanie do strumienia bajtów
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        return new MockMultipartFile(
                "diet_template.xlsx",
                "diet_template.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                bos.toByteArray()
        );
    }

    @Test
    @DisplayName("Powinien poprawnie parsować plik Excel z dietą")
    void parseDietExcel_shouldParseExcelFile() throws IOException {
        // given
        MultipartFile file = createMockExcelFile();

        // when
        ExcelParserService.ParsedExcelResult result = excelParserService.parseDietExcel(file);

        // then
        assertNotNull(result);
        assertNotNull(result.meals());
        assertEquals(3, result.totalMeals()); // 3 posiłki
        assertNotNull(result.shoppingList());

        // Sprawdzenie pierwszego posiłku
        ParsedMeal meal1 = result.meals().getFirst();
        assertEquals("Owsianka z owocami", meal1.getName());
        assertEquals("Ugotować płatki na mleku, dodać owoce", meal1.getInstructions());
        assertEquals(3, meal1.getIngredients().size());

        // Sprawdzenie wartości odżywczych
        NutritionalValues nutritionalValues1 = meal1.getNutritionalValues();
        assertNotNull(nutritionalValues1);
        assertEquals(350.0, nutritionalValues1.getCalories());
        assertEquals(15.0, nutritionalValues1.getProtein());
        assertEquals(7.0, nutritionalValues1.getFat());
        assertEquals(60.0, nutritionalValues1.getCarbs());

        // Sprawdzenie trzeciego posiłku (niepełnego)
        ParsedMeal meal3 = result.meals().get(2);
        assertEquals("Koktajl proteinowy", meal3.getName());
        assertTrue(meal3.getInstructions().isEmpty());
        assertTrue(meal3.getIngredients().isEmpty());
        assertNull(meal3.getNutritionalValues());
    }

    @Test
    @DisplayName("Powinien pomijać puste wiersze i wiersze bez nazwy posiłku")
    void parseDietExcel_shouldSkipEmptyRowsAndRowsWithoutMealName() throws IOException {
        // given
        MultipartFile file = createMockExcelFile();

        // when
        ExcelParserService.ParsedExcelResult result = excelParserService.parseDietExcel(file);

        // then
        assertEquals(3, result.totalMeals()); // Tylko 3 posiłki, jeden pusty wiersz został pominięty
    }

    @Test
    @DisplayName("Powinien poprawnie parsować wartości odżywcze")
    void parseNutritionalValues_shouldCorrectlyParseNutritionalValues() throws Exception {
        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("parseNutritionalValues", String.class);
        method.setAccessible(true);

        // given, when
        NutritionalValues result1 = (NutritionalValues) method.invoke(excelParserService, "350,15,7,60");
        NutritionalValues result2 = (NutritionalValues) method.invoke(excelParserService, "250,30,10,5");
        NutritionalValues result3 = (NutritionalValues) method.invoke(excelParserService, (Object) null);
        NutritionalValues result4 = (NutritionalValues) method.invoke(excelParserService, "");
        NutritionalValues result5 = (NutritionalValues) method.invoke(excelParserService, "niepoprawne wartości");
        NutritionalValues result6 = (NutritionalValues) method.invoke(excelParserService, "100,200,300,1500"); // Za duża wartość

        // then
        assertNotNull(result1);
        assertEquals(350.0, result1.getCalories());
        assertEquals(15.0, result1.getProtein());
        assertEquals(7.0, result1.getFat());
        assertEquals(60.0, result1.getCarbs());

        assertNotNull(result2);
        assertEquals(250.0, result2.getCalories());
        assertEquals(30.0, result2.getProtein());
        assertEquals(10.0, result2.getFat());
        assertEquals(5.0, result2.getCarbs());

        assertNull(result3); // null wejściowy
        assertNull(result4); // pusty string
        assertNull(result5); // niepoprawny format
        assertNull(result6); // za duża wartość
    }

    @Test
    @DisplayName("Powinien poprawnie parsować pojedynczą wartość odżywczą")
    void parseNutritionalValue_shouldCorrectlyParseNutritionalValue() throws Exception {
        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("parseNutritionalValue", String.class);
        method.setAccessible(true);

        // given, when, then
        assertEquals(350.0, (Double) method.invoke(excelParserService, "350"));
        assertEquals(15.5, (Double) method.invoke(excelParserService, "15,5"));
        assertEquals(7.25, (Double) method.invoke(excelParserService, "7.25"));
        assertEquals(0.0, (Double) method.invoke(excelParserService, "0"));
    }

    @Test
    @DisplayName("Powinien poprawnie walidować wartość odżywczą")
    void isValidNutritionalValue_shouldCorrectlyValidateNutritionalValue() throws Exception {
        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("isValidNutritionalValue", double.class);
        method.setAccessible(true);

        // given, when, then
        assertTrue((Boolean) method.invoke(excelParserService, 0.0));
        assertTrue((Boolean) method.invoke(excelParserService, 100.0));
        assertTrue((Boolean) method.invoke(excelParserService, 500.0));
        assertTrue((Boolean) method.invoke(excelParserService, 1000.0));

        assertFalse((Boolean) method.invoke(excelParserService, -1.0));
        assertFalse((Boolean) method.invoke(excelParserService, 1001.0));
    }

    @Test
    @DisplayName("Powinien poprawnie parseProduct")
    void parseProduct_shouldCorrectlyParseProduct() throws Exception {
        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("parseProduct", String.class);
        method.setAccessible(true);

        // given
        String ingredient = "50g mąka";
        ParsedProduct expectedProduct = ParsedProduct.builder()
                .name("mąka")
                .quantity(50.0)
                .unit("g")
                .original(ingredient)
                .hasCustomUnit(false)
                .build();

        when(productParsingService.parseProduct(ingredient)).thenReturn(new ParsingResult(expectedProduct));
        when(categorizationService.suggestCategory(any(ParsedProduct.class))).thenReturn("pieczywo");

        // when
        ParsedProduct result = (ParsedProduct) method.invoke(excelParserService, ingredient);

        // then
        assertNotNull(result);
        assertEquals("mąka", result.getName());
        assertEquals(50.0, result.getQuantity());
        assertEquals("g", result.getUnit());
        assertEquals(ingredient, result.getOriginal());
        assertEquals("pieczywo", result.getCategoryId());

        verify(categorizationService).updateCategorization(any(ParsedProduct.class));
    }

    @Test
    @DisplayName("Powinien obsłużyć błędy w parseProduct")
    void parseProduct_shouldHandleErrorsGracefully() throws Exception {
        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("parseProduct", String.class);
        method.setAccessible(true);

        // given
        String ingredient = "niepoprawny składnik";

        // Wymuszenie błędu
        when(productParsingService.parseProduct(ingredient)).thenThrow(new RuntimeException("Błąd parsowania"));

        // when
        ParsedProduct result = (ParsedProduct) method.invoke(excelParserService, ingredient);

        // then
        assertNotNull(result);
        assertEquals(ingredient, result.getName());
        assertEquals(1.0, result.getQuantity());
        assertEquals("szt", result.getUnit());
        assertEquals(ingredient, result.getOriginal());
        assertNull(result.getCategoryId());
    }

    @Test
    @DisplayName("Powinien obliczać podobieństwo między stringami")
    void calculateSimilarity_shouldCalculateSimilarityBetweenStrings() throws Exception {
        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("calculateSimilarity", String.class, String.class);
        method.setAccessible(true);

        // given, when, then
        // Identyczne stringi
        assertEquals(1.0, (Double) method.invoke(excelParserService, "mąka", "mąka"));

        // Różne wielkości liter
        assertEquals(1.0, (Double) method.invoke(excelParserService, "Mąka", "mąka"));

        // Podobne stringi
        double similarityMakaMaka = (Double) method.invoke(excelParserService, "mąka", "maka");
        assertTrue(similarityMakaMaka > 0.7);

        // Różne stringi
        double similarityMakaJablko = (Double) method.invoke(excelParserService, "mąka", "jabłko");
        assertTrue(similarityMakaJablko < 0.5);
    }

    @Test
    @DisplayName("Powinien znajdować najlepsze dopasowanie")
    void findBestMatch_shouldFindBestMatch() throws Exception {

        ExcelParserService testService = new ExcelParserService(
                productParsingService, categorizationService, unitService, excelParserConfig) {

            @Override
            double calculateSimilarity(String str1, String str2) {
                if (str1.equals("mąka") && str2.equals("mąka pszenna")) return 0.95;
                if (str1.equals("mąka") && str2.equals("mleko")) return 0.3;
                if (str1.equals("mąka") && str2.equals("cukier")) return 0.3;

                if (str1.equals("mleko 3.2%") && str2.equals("mąka pszenna")) return 0.3;
                if (str1.equals("mleko 3.2%") && str2.equals("mleko")) return 0.95;
                if (str1.equals("mleko 3.2%") && str2.equals("cukier")) return 0.3;

                if (str1.equals("jabłko") && str2.equals("mąka pszenna")) return 0.3;
                if (str1.equals("jabłko") && str2.equals("mleko")) return 0.3;
                if (str1.equals("jabłko") && str2.equals("cukier")) return 0.3;

                return 0.0;
            }
        };

        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("findBestMatch", String.class, Set.class);
        method.setAccessible(true);

        // given
        Set<String> existingNames = new HashSet<>(Arrays.asList("mąka pszenna", "mleko", "cukier"));

        // when, then
        assertEquals("mąka pszenna", method.invoke(testService, "mąka", existingNames));
        assertEquals("mleko", method.invoke(testService, "mleko 3.2%", existingNames));
        assertNull(method.invoke(testService, "jabłko", existingNames));
    }

    @Test
    @DisplayName("Powinien łączyć podobne produkty")
    void combineSimilarProducts_shouldCombineSimilarProducts() throws Exception {
        // Użycie refleksji do wywołania prywatnej metody
        java.lang.reflect.Method method = ExcelParserService.class.getDeclaredMethod("combineSimilarProducts", List.class);
        method.setAccessible(true);

        // given
        ParsedProduct product1 = ParsedProduct.builder()
                .name("mąka pszenna")
                .quantity(200.0)
                .unit("g")
                .original("200g mąka pszenna")
                .build();

        ParsedProduct product2 = ParsedProduct.builder()
                .name("mąka")
                .quantity(100.0)
                .unit("g")
                .original("100g mąka")
                .build();

        List<ParsedProduct> products = Arrays.asList(product1, product2);

        // when
        @SuppressWarnings("unchecked")
        List<ParsedProduct> result = (List<ParsedProduct>) method.invoke(excelParserService, products);

        // then
        assertNotNull(result);
        assertEquals(2, result.size());
    }
}